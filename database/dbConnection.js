require('dotenv').config()
const mysql = require('mysql2');
const logger = require('../src/config/config').logger

const dbConfig = {
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};
    

// module.exports = pool;
const pool = mysql.createPool(dbConfig);

pool.on('acquire', function (connection) {
  logger.log('Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
  logger.log('Connection %d released', connection.threadId);
});

module.exports = pool;