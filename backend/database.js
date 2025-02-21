// Import the sqlite3 library
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('./backend/library.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    createTables(); // Call the function to create tables
  }
});

// Function to create tables
function createTables() {
  // Create the Books table
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT,
      year INTEGER,
      bar_code INTEGER,
      total_copies INTEGER NOT NULL,
      avail_copies INTEGER
    )
  `, (err) => {
    if (err) {
      console.error('Error creating the Books table:', err.message);
    } else {
      console.log('Books table created or already exists.');
    }
  });

  // Create the Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      user_name TEXT NOT NULL UNIQUE,
      phone_number TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating the Users table:', err.message);
    } else {
      console.log('Users table created or already exists.');
    }
  });

  // Create the Loans table
  db.run(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      return_date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating the Loans table:', err.message);
    } else {
      console.log('Loans table created or already exists.');
    }
  });
}

// Close the database connection when done
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

// Export the database object for use in other files
module.exports = db;