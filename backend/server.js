const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 5000;

// Middleware สำหรับ parse JSON จาก request body
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

  // สร้าง database
  await connection.query("CREATE DATABASE IF NOT EXISTS pos");
  console.log("✅ Database 'pos' ready");

  pool = mysql.createPool({
    ...dbConfig,
    database: "pos",
    waitForConnections: true,
    connectionLimit: 10
  });

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
    CREATE TABLE IF NOT EXISTS imports (
      import_id INT AUTO_INCREMENT PRIMARY KEY,
      import_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Table 'imports' ready");

  // import_items
  await pool.query(`
    CREATE TABLE IF NOT EXISTS import_items (
      import_item_id INT AUTO_INCREMENT PRIMARY KEY,
      import_id INT,
      product_id VARCHAR(50),
      quantity INT NOT NULL,
      FOREIGN KEY (import_id) REFERENCES imports(import_id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
    )
  `);
  console.log("✅ Table 'import_items' ready");

  // exports (การนำออก)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS exports (
      export_id INT AUTO_INCREMENT PRIMARY KEY,
      address TEXT NOT NULL,
      export_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Table 'exports' ready");

  // export_items
  await pool.query(`
    CREATE TABLE IF NOT EXISTS export_items (
      export_item_id INT AUTO_INCREMENT PRIMARY KEY,
      export_id INT,
      product_id VARCHAR(50),
      quantity INT NOT NULL,
      FOREIGN KEY (export_id) REFERENCES exports(export_id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
    )
  `);
  console.log("✅ Table 'export_items' ready");

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

// Endpoint สำหรับดึงรายการสินค้า
app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint สำหรับดึงรายการนำเข้า
app.get('/imports', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM imports');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint สำหรับดึงรายการส่งออก
app.get('/exports', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM exports');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint สำหรับสร้างรายการนำเข้า (import)
// Request body คาดหวังรูปแบบ: { items: [{ product_id, product_name, quantity }] }
app.post('/imports', async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid items format" });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // สร้างรายการนำเข้าใหม่
    const [importResult] = await connection.query("INSERT INTO imports () VALUES ()");
    const importId = importResult.insertId;

    // สำหรับแต่ละรายการนำเข้าสินค้า
    for (const rawItem of items) {
      console.log("👉 rawItem:", rawItem);
      const product_id = rawItem.product_id.trim();
      const quantity = Number(rawItem.quantity);

      if (!product_id) {
        throw new Error("Missing product_id for one of the items");
      }
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for product ${product_id}`);
      }

      // ตรวจสอบว่าสินค้านั้นมีอยู่ในฐานข้อมูลหรือไม่
      const [rows] = await connection.query(
        "SELECT * FROM products WHERE product_id = ?",
        [product_id]
      );

      if (rows.length > 0) {
        // ถ้ามีสินค้าอยู่แล้ว ให้ update stock
        await connection.query(
          "UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?",
          [quantity, product_id]
        );
      } else {
        // ถ้าไม่พบสินค้าในฐานข้อมูล ให้ insert สินค้าใหม่ โดยตรวจสอบว่ามี product_name
        if (!rawItem.product_name || rawItem.product_name.trim() === "") {
          throw new Error(`Product name required for new product ${product_id}`);
        }
        const product_name = rawItem.product_name.trim();
        await connection.query(
          "INSERT INTO products (product_id, product_name, stock_quantity) VALUES (?, ?, ?)",
          [product_id, product_name, quantity]
        );
      }
      
      // บันทึกการนำเข้าสินค้าใน import_items
      await connection.query(
        "INSERT INTO import_items (import_id, product_id, quantity) VALUES (?, ?, ?)",
        [importId, product_id, quantity]
      );
    }

    await connection.commit();
    res.status(201).json({ import_id: importId });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in /imports:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Endpoint สำหรับสร้างรายการส่งออก (export)
// Request body คาดหวังรูปแบบ: { address: string, items: [{ product_id, quantity }] }
app.post('/exports', async (req, res) => {
  const { address, items } = req.body;
  if (!address || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid format" });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // สร้างรายการส่งออกใหม่
    const [exportResult] = await connection.query("INSERT INTO exports (address) VALUES (?)", [address]);
    const exportId = exportResult.insertId;

    // ตรวจสอบ stock และบันทึกรายการส่งออกสินค้า
    for (const item of items) {
      // ตรวจสอบว่ามี stock เพียงพอหรือไม่
      const [rows] = await connection.query("SELECT stock_quantity FROM products WHERE product_id = ?", [item.product_id]);
      const stock = rows[0]?.stock_quantity || 0;
      if (stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }
      await connection.query("INSERT INTO export_items (export_id, product_id, quantity) VALUES (?, ?, ?)", [exportId, item.product_id, item.quantity]);
      await connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?", [item.quantity, item.product_id]);
    }

    await connection.commit();
    res.status(201).json({ export_id: exportId });
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


