const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors({
  origin: "http://localhost:3000"
}));
app.use(express.json());

// Serve static files from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/'); // Save files to the 'images' folder
  },
  filename: function (req, file, cb) {
    // Use a unique name to avoid conflicts: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;
async function initDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  await connection.query("CREATE DATABASE IF NOT EXISTS pos");
  console.log("✅ Database 'pos' ready");

  pool = mysql.createPool({
    ...dbConfig,
    database: "pos",
    waitForConnections: true,
    connectionLimit: 10
  });

  // Disable foreign key checks to allow dropping tables in any order during development reset.
  await pool.query('SET FOREIGN_KEY_CHECKS = 0;');

  // products (สินค้าในสต็อก)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      product_id VARCHAR(50) PRIMARY KEY,
      product_name VARCHAR(255) NOT NULL,
      image_path VARCHAR(255),
      stock_quantity INT DEFAULT 0,
      price DECIMAL(10,2) DEFAULT 0.00,
      deleted_at DATETIME DEFAULT NULL
    )
  `);
  console.log("✅ Table 'products' ready");

  // imports (การนำเข้า)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS imports (
      import_id INT AUTO_INCREMENT PRIMARY KEY,
      product_id VARCHAR(50) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      import_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      image_path VARCHAR(255)
    )
  `);
  // This is a simple migration to ensure the 'batch_id' column is a VARCHAR for custom IDs.
  const [importColumns] = await pool.query("SHOW COLUMNS FROM `imports` LIKE 'batch_id'");
  if (importColumns.length === 0) {
    console.log("Applying schema migration: Adding 'batch_id' column to 'imports' table...");
    await pool.query('ALTER TABLE `imports` ADD COLUMN `batch_id` VARCHAR(50) NULL AFTER `import_id`');
    console.log("✅ Column 'batch_id' added.");
  } else if (importColumns[0].Type.startsWith('int')) {
    console.log("Applying schema migration: Modifying 'batch_id' column to VARCHAR(50)...");
    await pool.query('ALTER TABLE `imports` MODIFY COLUMN `batch_id` VARCHAR(50) NULL');
    console.log("✅ Column 'batch_id' modified.");
  }
  console.log("✅ Table 'imports' ready");

  // exports (การนำออก)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS exports (
      export_id INT AUTO_INCREMENT PRIMARY KEY,
      product_id VARCHAR(50) NOT NULL,
      quantity INT NOT NULL,
      export_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Table 'exports' ready");

  // Re-enable foreign key checks
  await pool.query('SET FOREIGN_KEY_CHECKS = 1;');

  // เติมสินค้าเริ่มต้นถ้ายังไม่มี
  const [productsCount] = await pool.query("SELECT COUNT(*) AS count FROM products");
  if (productsCount[0].count === 0) {
    await pool.query(
      "INSERT INTO products (product_id, product_name, price, stock_quantity, image_path) VALUES ?",
      [[
        ["P001", "Orange Juice", 25.0, 100, "/images/orange.jpg"],
        ["P002", "Dango", 15.0, 200, "/images/dango.jpg"],
        ["P003", "Green Tea", 30.0, 150, "/images/green-tea.jpg"]
      ]]
    );
    console.log("✅ Sample products inserted");
  }
}

// Endpoint สำหรับดึงรายการสินค้าทั้งหมด
app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE deleted_at IS NULL');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint สำหรับดึงประวัติการนำเข้าสินค้า (รวมชื่อสินค้า)
app.get('/imports', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.import_id,
        COALESCE(i.batch_id, CAST(i.import_id AS CHAR)) AS batch_id,
        i.product_id,
        p.product_name,
        i.quantity,
        COALESCE(batch_dates.batch_import_date, i.import_date) AS import_date,
        p.image_path
      FROM imports i
      JOIN products p ON i.product_id = p.product_id
      LEFT JOIN
        (
            SELECT
                batch_id,
                MIN(import_date) as batch_import_date
            FROM
                imports
            WHERE batch_id IS NOT NULL
            GROUP BY
                batch_id
        ) AS batch_dates ON i.batch_id = batch_dates.batch_id
      ORDER BY
        COALESCE(batch_dates.batch_import_date, i.import_date) DESC,
        i.import_id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to delete products
app.delete('/products', async (req, res) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: "Invalid request: 'productIds' must be a non-empty array." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Soft delete: Instead of deleting, mark the products as deleted
    const placeholders = productIds.map(() => '?').join(',');
    const [updateResult] = await connection.query(`UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE product_id IN (${placeholders}) AND deleted_at IS NULL`, productIds);

    if (updateResult.affectedRows === 0) {
      throw new Error('ไม่พบสินค้าที่ต้องการลบ');
    }

    await connection.commit();
    res.status(200).json({ message: `Successfully deleted ${updateResult.affectedRows} products.` });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in DELETE /products:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/imports', upload.array('files'), async (req, res) => {
  // 'items' data is sent as a JSON string in the 'items' field
  const items = JSON.parse(req.body.items);
  const customOrderId = req.body.orderId; // Get the custom ID from the form
  const files = req.files; // uploaded files are in req.files

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid request: 'items' must be a non-empty array." });
  }

  // Create a map of original filename to the new path on the server
  const fileMap = {};
  if (files) {
    files.forEach(file => {
      // The key is the original name of the file uploaded from the client
      // The value is the path where it's stored on the server
      fileMap[file.originalname] = `/images/${file.filename}`;
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let batchId = null; // This will hold the ID for the entire batch.

    for (const [index, item] of items.entries()) {
      const { product_id, product_name, quantity, price, original_filename } = item;

      if (!product_id || !product_name || quantity === undefined) {
        throw new Error("Missing required fields in one of the items: product_id, product_name, or quantity");
      }

      const image_path = original_filename ? fileMap[original_filename] : null;
      const product_price = parseFloat(price) || 0.00;

      const upsertQuery = `
        INSERT INTO products (product_id, product_name, stock_quantity, image_path, price) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        stock_quantity = stock_quantity + VALUES(stock_quantity),
        image_path = IF(VALUES(image_path) IS NOT NULL, VALUES(image_path), products.image_path),
        deleted_at = NULL;
      `;
      await connection.query(upsertQuery, [product_id, product_name, quantity, image_path, product_price]);

      // Record the import transaction
      if (index === 0) {
        // For the first item, insert it to get an ID
        const [result] = await connection.query(
          'INSERT INTO imports (product_id, product_name, quantity, image_path) VALUES (?, ?, ?, ?)',
          [product_id, product_name, quantity, image_path]
        );
        const autoGeneratedId = result.insertId;
        // Use custom ID if provided, otherwise use the auto-generated ID
        batchId = (customOrderId && customOrderId.trim() !== '') ? customOrderId.trim() : autoGeneratedId.toString();
        // Now, update this first entry to set its own batch_id
        await connection.query('UPDATE imports SET batch_id = ? WHERE import_id = ?', [batchId, autoGeneratedId]);
      } else {
        // For subsequent items, insert them with the already determined batchId
        await connection.query(
          'INSERT INTO imports (batch_id, product_id, product_name, quantity, image_path) VALUES (?, ?, ?, ?, ?)',
          [batchId, product_id, product_name, quantity, image_path]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: "Import successful" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in /imports:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});


// Endpoint สำหรับดึงประวัติการส่งออก (Exports)
app.get('/exports', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.export_id,
        e.product_id,
        p.product_name,
        p.image_path,
        e.quantity,
        e.export_date
      FROM exports e
      JOIN products p ON e.product_id = p.product_id
      ORDER BY e.export_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint สำหรับสร้างรายการส่งออก (export)
// รับข้อมูล: { product_id, quantity }
app.post('/exports', async (req, res) => {
  const { items } = req.body; // Expects { items: [{ product_id, quantity }] }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Invalid request: 'items' must be a non-empty array." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    for (const item of items) {
      const { product_id, quantity } = item;
      if (!product_id || !quantity || quantity <= 0) {
        throw new Error(`Invalid data for item: ${JSON.stringify(item)}. Quantity must be a positive number.`);
      }

      // Check stock and lock the row for update to prevent race conditions
      const [rows] = await connection.query("SELECT product_name, stock_quantity FROM products WHERE product_id = ? AND deleted_at IS NULL FOR UPDATE", [product_id]);
      
      if (rows.length === 0) {
        throw new Error(`Product with ID ${product_id} not found.`);
      }

      const stock = rows[0].stock_quantity;
      const productName = rows[0].product_name;
      if (stock < quantity) {
        throw new Error(`Insufficient stock for product ${productName} (${product_id}). Available: ${stock}, Requested: ${quantity}`);
      }

      // Update stock
      await connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?", [quantity, product_id]);
      
      // Record the export
      await connection.query("INSERT INTO exports (product_id, quantity) VALUES (?, ?)", [product_id, quantity]);
    }

    await connection.commit();
    res.status(201).json({ message: "Export successful" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in /exports:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error("Error initializing database:", err);
  });
