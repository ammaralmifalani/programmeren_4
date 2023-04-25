const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "share-a-meal-programmeren-4",
});

connection.connect();

connection.query(
  "SELECT name, id FROM meal;",
  function (error, results, fields) {
    if (error) throw error;
    console.log("The solution is: ", results[0]);
  }
);

connection.end();
