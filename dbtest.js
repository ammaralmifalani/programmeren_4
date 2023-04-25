const mysql = require('mysql');
require('dotenv').config();
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect();

connection.query(
  'SELECT name, id FROM meal;',
  function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0]);
  }
);

connection.end();
