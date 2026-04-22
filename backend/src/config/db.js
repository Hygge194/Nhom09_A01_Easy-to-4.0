const mysql = require('mysql2/promise');


import mysql from "mysql2";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;
// Log để kiểm tra
pool.getConnection()
    .then(connection => {
        console.log('✅ Kết nối trực tiếp Aiven thành công!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Vẫn lỗi kết nối:', err.message);
    });

module.exports = pool;