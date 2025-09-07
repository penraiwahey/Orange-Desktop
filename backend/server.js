const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = 5000;

app.use(cors({
  origin: "http://localhost:3000"
}));
app.use(express.json());

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
      price DECIMAL(10,2) DEFAULT 0.00
    )
  `);
  console.log("✅ Table 'products' ready");

  // imports (การนำเข้า)
  await pool.query(`
    DROP TABLE IF EXISTS imports;
  `);
  await pool.query(`
    CREATE TABLE imports (
      import_id INT AUTO_INCREMENT PRIMARY KEY,
      product_id VARCHAR(50) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      import_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
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
    const [rows] = await pool.query('SELECT * FROM products');
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
        import_id,
        product_id,
        product_name,
        quantity,
        import_date
      FROM imports
      ORDER BY import_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/imports', async (req, res) => {
  const { items } = req.body;

  // Validate that the request body contains a non-empty array of items.
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Invalid request: 'items' must be a non-empty array." });
  }

  let connection;
  try {
    // Get a connection from the pool and start a transaction.
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Loop through each item in the array and perform the database operations.
    for (const item of items) {
      const { product_id, product_name, quantity } = item;

      // Basic validation for each item
      if (!product_id || !product_name || quantity === undefined) {
        throw new Error("Missing required fields in one of the items: product_id, product_name, or quantity");
      }
      
      // Use a single query to either insert a new product or update the stock of an existing one.
      // The ON DUPLICATE KEY UPDATE clause handles the logic efficiently.
      const upsertQuery = `
        INSERT INTO products (product_id, product_name, stock_quantity) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        stock_quantity = stock_quantity + VALUES(stock_quantity);
      `;
      await connection.query(upsertQuery, [product_id, product_name, quantity]);

      // Record the import transaction in the imports table
      const importQuery = `
        INSERT INTO imports (product_id, product_name, quantity) 
        VALUES (?, ?, ?);
      `;
      await connection.query(importQuery, [product_id, product_name, quantity]);
    }

    // Commit the transaction if all queries were successful.
    await connection.commit();
    res.status(201).json({ message: "Import successful" });
  } catch (error) {
    // If an error occurred, roll back the transaction.
    if (connection) await connection.rollback();
    console.error("Error in /imports:", error);
    // Send a generic 500 status with the error message.
    res.status(500).json({ error: error.message });
  } finally {
    // Always release the connection back to the pool.
    if (connection) connection.release();
  }
});


// Endpoint สำหรับดึงประวัติการส่งออก (Exports)
app.get('/exports', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM exports');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint สำหรับสร้างรายการส่งออก (export)
// รับข้อมูล: { product_id, quantity }
app.post('/exports', async (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || quantity === undefined) {
    return res.status(400).json({ error: "Missing required fields: product_id or quantity" });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // ตรวจสอบ stock เพียงพอหรือไม่
    const [rows] = await connection.query("SELECT stock_quantity FROM products WHERE product_id = ?", [product_id]);
    const stock = rows[0]?.stock_quantity || 0;
    if (stock < quantity) {
      throw new Error(`Insufficient stock for product ${product_id}`);
    }

    // อัปเดต stock
    await connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?", [quantity, product_id]);
    
    // บันทึกรายการส่งออก
    await connection.query("INSERT INTO exports (product_id, quantity) VALUES (?, ?)", [product_id, quantity]);

    await connection.commit();
    res.status(201).json({ message: "Export successful" });
  } catch (error) {
    if (connection) await connection.rollback();
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
