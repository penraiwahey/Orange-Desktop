const express = require('express');
const mysql = require('mysql2/promise');


const app = express();
const port = 5000; 


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
  // เชื่อมต่อ MySQL ก่อน (ยังไม่ระบุ database)
  const connection = await mysql.createConnection(dbConfig);

  // สร้าง database ถ้ายังไม่มี
  await connection.query("CREATE DATABASE IF NOT EXISTS pos");
  console.log("✅ Database 'pos' ready");

  // ใช้ database pos
  pool = mysql.createPool({
    ...dbConfig,
    database: "pos",
    waitForConnections: true,
    connectionLimit: 10
  });

  // สร้าง table users ถ้ายังไม่มี
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100)
    )
  `);
  console.log("✅ Table 'users' ready");

  // สร้าง table products ถ้ายังไม่มี
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      price DECIMAL(10,2)
    )
  `);
  console.log("✅ Table 'products' ready");

  // เติม data ตัวอย่าง ถ้ายังไม่มี
  const [usersCount] = await pool.query("SELECT COUNT(*) AS count FROM users");
  if (usersCount[0].count === 0) {
    await pool.query(
      "INSERT INTO users (name, email) VALUES ?",
      [[
        ["Alice", "alice@example.com"],
        ["Bob", "bob@example.com"]
      ]]
    );
    console.log("✅ Sample users inserted");
  }

  const [productsCount] = await pool.query("SELECT COUNT(*) AS count FROM products");
  if (productsCount[0].count === 0) {
    await pool.query(
      "INSERT INTO products (name, price) VALUES ?",
      [[
        ["Orange Juice", 25.0],
        ["Dango", 15.0],
        ["Green Tea", 30.0]
      ]]
    );
    console.log("✅ Sample products inserted");
  }
}
initDatabase().catch(err => {
  console.error("Error initializing database:", err);
});

app.get('/users', async (req, res) => {
    try {
      
        const [rows] = await pool.query('SELECT * FROM users'); 
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/products", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM products");
  res.json(rows);
});


app.get('/', (req, res) => {
    res.send('Hello! Server is running. Try accessing /users');
});



app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});