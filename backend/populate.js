const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');

const db = require('./database');

    

fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (row) => {
    db.run("DELETE FROM books");
    db.run("DELETE FROM loans")
    db.run(
      `INSERT INTO books (title, author, year, bar_code, total_copies, avail_copies VALUES (?, ?, ?, ?,)`,
      [row.column3,row.column2,row.column4,row.column7]
    );
  })
  .on('end', () => {
    console.log('CSV file successfully imported');
    db.close();
  });
