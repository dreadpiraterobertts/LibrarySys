const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000; // Use dynamic port
const db = require('./database'); // Ensure correct file paths

app.use(express.json());
app.use(cors({
  origin: '*',  // Allow requests from anywhere (including Electron)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


//get all books
app.get('/books', (req, res) => {
  const { search, page, limit } = req.query;
  
  let query = 'SELECT * FROM books';
  let params = [];

  if (search) {
      query += ' WHERE title LIKE ? OR author LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
  }

  // Apply pagination only if limit and page are provided
  if (limit && page) {
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));
  }

  db.all(query, params, (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
      } else {
          res.json(rows);
      }
  });
});
//availalbe books
app.get('/books/available',(req,res)=>{
  const { search, page, limit } = req.query;
  
  let query = 'SELECT * FROM books WHERE avail_copies > 0';
  let params = [];

  if (search) {
      query += ' WHERE title LIKE ? OR author LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
  }

  // Apply pagination only if limit and page are provided
  if (limit && page) {
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));
  }

  db.all(query, params, (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
      } else {
          res.json(rows);
      }
  });

})
  // Add a Book
app.post('/books', (req, res) => {
    const { title, author, year, bar_code, total_copies } = req.body;
    const query = `
      INSERT INTO books (title, author, year, bar_code, total_copies, avail_copies)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [title, author, year, bar_code, total_copies, total_copies];
  
    db.run(query, params, function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID });
      }
    });
  });
 
//Edit a book
app.put('/books/:id', async (req, res) => {
  const { title, author, year, bar_code, total_copies } = req.body;
  const bookId = req.params.id;

  // Validate input
  if (!title || !author || !year || !bar_code || total_copies === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Fetch the current total_copies and avail_copies from the database
    const getCurrentDataQuery = `SELECT total_copies, avail_copies FROM books WHERE id = ?`;
    const currentData = await new Promise((resolve, reject) => {
      db.get(getCurrentDataQuery, [bookId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!currentData) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const { total_copies: currentTotalCopies, avail_copies: currentAvailCopies } = currentData;

    // Calculate the difference between the new total_copies and the current total_copies
    const difference = total_copies - currentTotalCopies;

    // Calculate the new avail_copies
    const newAvailCopies = currentAvailCopies + difference;

    // Check if the new avail_copies would go below zero
    if (newAvailCopies < 0) {
      return res.status(400).json({ error: 'Cannot subtract more copies than available' });
    }

    // Update the book with the new total_copies and avail_copies
    const updateQuery = `
      UPDATE books
      SET title = ?, author = ?, year = ?, bar_code = ?, total_copies = ?, avail_copies = ?
      WHERE id = ?
    `;
    const params = [title, author, year, bar_code, total_copies, newAvailCopies, bookId];

    await new Promise((resolve, reject) => {
      db.run(updateQuery, params, function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'Book updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//delete book
app.delete('/books/:id', (req, res) => {
  const query = 'DELETE FROM books WHERE id = ?';
  const params = [req.params.id];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Book deleted successfully' });
    }
  });
});


//USER HANDLING

//get user either by search, page or getallusers
app.get('/users', (req, res) => {
  const { search, page, limit } = req.query;
  let query = 'SELECT * FROM users';
  let params = [];

  if (search) {
    query += ' WHERE full_name LIKE ? OR user_name LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  // Apply pagination only if both page and limit are provided
  if (limit && page) {
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

//add user
app.post("/users", (req, res) => {
  const { full_name, user_name, phone_number } = req.body;

  if (!full_name || !user_name || !phone_number) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.get("SELECT * FROM users WHERE user_name = ?", [user_name], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (row) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Insert new user if username is unique
    db.run(
      "INSERT INTO users (full_name, user_name, phone_number) VALUES (?, ?, ?)",
      [full_name, user_name, phone_number],
      function (err) {
        if (err) {
          return res.status(500).json({ error: "Failed to add user" });
        }
        res.status(201).json({ message: "User added successfully!" });
      }
    );
  });
});

//edit user
app.put('/users/:id', (req, res) => {
  const { full_name, user_name, phone_number } = req.body;
  const query = `
    UPDATE users
    SET full_name = ?, user_name = ?, phone_number = ?
    WHERE id = ?
  `;
  const params = [full_name, user_name, phone_number, req.params.id];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'User updated successfully' });
    }
  });
});
//delete user
app.delete('/users/:id', (req, res) => {
  const query = 'DELETE FROM users WHERE id = ?';
  const params = [req.params.id];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'User deleted successfully' });
    }
  });
});
  // Issue a Loan
  app.post('/loans', (req, res) => {
    const { user_id, book_id, due_date } = req.body;
    
    if (!user_id || !book_id || !due_date) {
      return res.status(400).json({ error: "Missing required fields: user_id, book_id, due_date" });
    }
  
    const issue_date = new Date().toISOString().split('T')[0]; // Format: "YYYY-MM-DD"
  
    // Step 1: Validate user existence
    const userCheck = `SELECT id FROM users WHERE id = ?`;
    db.get(userCheck, [user_id], (err, userRow) => {
      if (err) return res.status(500).json({ error: "Database error checking user" });
      if (!userRow) return res.status(400).json({ error: "User does not exist" });
  
      // Step 2: Validate book availability
      const bookCheck = `SELECT * FROM books WHERE id = ? AND avail_copies > 0`;
      db.get(bookCheck, [book_id], (err, bookRow) => {
        if (err) return res.status(500).json({ error: "Database error checking book" });
        if (!bookRow) return res.status(400).json({ error: "Book unavailable or does not exist" });
  
        // Step 3: Insert loan record
        const loanQuery = `INSERT INTO loans (user_id, book_id, issue_date, due_date) VALUES (?, ?, ?, ?)`;
        db.run(loanQuery, [user_id, book_id, issue_date, due_date], function (err) {
          if (err) {
            console.error("Error inserting loan:", err.message);
            return res.status(500).json({ error: "Failed to insert loan" });
          }
  
          console.log("Loan inserted successfully, ID:", this.lastID);
  
          // Step 4: Update book availability
          const updateBookQuery = `UPDATE books SET avail_copies = avail_copies - 1 WHERE id = ?`;
          db.run(updateBookQuery, [book_id], function (err) {
            if (err) {
              console.error("Error updating book availability:", err.message);
              return res.status(500).json({ error: "Failed to update book availability" });
            }
  
            res.json({ success: true, message: "Loan issued successfully!", loan_id: this.lastID });
          });
        });
      });
    });
  });
  
  // Return a Book
  app.put('/loans/:id/return', (req, res) => {
    const { return_date } = req.body;
  
    if (!return_date) {
      return res.status(400).json({ error: "Return date is required." });
    }
  
    // Step 1: Check if the loan exists and hasn't been returned
    db.get(`SELECT book_id, return_date FROM loans WHERE id = ?`, [req.params.id], (err, loanRow) => {
      if (err) {
        return res.status(500).json({ error: "Error occurred when checking loan record" });
      }
  
      if (!loanRow) {
        return res.status(404).json({ error: "Loan not found." });
      }
  
      if (loanRow.return_date) {
        return res.status(400).json({ error: "This book has already been returned." });
      }
  
      // Step 2: Update the return_date in the loans table
      const updateLoanQuery = `UPDATE loans SET return_date = ? WHERE id = ?`;
      db.run(updateLoanQuery, [return_date, req.params.id], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
  
        // Step 3: Update available copies of the book
        const updateBookQuery = `UPDATE books SET avail_copies = avail_copies + 1 WHERE id = ?`;
        db.run(updateBookQuery, [loanRow.book_id], function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
  
          res.json({ message: "Book returned successfully." });
        });
      });
    });
  });
  
  

// Get current loans with search & pagination
app.get('/loans/current', (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT loans.*, users.full_name, books.title
    FROM loans
    JOIN users ON loans.user_id = users.id
    JOIN books ON loans.book_id = books.id
    WHERE loans.return_date IS NULL
  `;
  let params = [];

  if (search) {
      query += ` AND (users.full_name LIKE ? OR books.title LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
  }

  query += ` LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  db.all(query, params, (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
      } else {
          res.json(rows);
      }
  });
});

// Get all loans with search & pagination
app.get('/loans', (req, res) => {
  const { search } = req.query;

  let query = `
    SELECT loans.*, users.full_name, books.title
    FROM loans
    JOIN users ON loans.user_id = users.id
    JOIN books ON loans.book_id = books.id
  `;
  let params = [];

  if (search) {
      query += ` WHERE users.full_name LIKE ? OR books.title LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
  }

  db.all(query, params, (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
      } else {
          res.json(rows); // Return all rows to the frontend
      }
  });
});


// Get overdue loans with search & pagination
app.get('/loans/overdue', (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT loans.*, users.full_name, books.title
    FROM loans
    JOIN users ON loans.user_id = users.id
    JOIN books ON loans.book_id = books.id
    WHERE loans.return_date IS NULL AND loans.due_date < DATE('now')
  `;
  let params = [];

  if (search) {
      query += ` AND (users.full_name LIKE ? OR books.title LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
  }

  query += ` LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  db.all(query, params, (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
      } else {
          res.json(rows);
      }
  });
});
// Get returned loans with search & pagination
app.get('/loans/returned', (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT loans.*, users.full_name, books.title
    FROM loans
    JOIN users ON loans.user_id = users.id
    JOIN books ON loans.book_id = books.id
    WHERE loans.return_date IS NOT NULL
  `;
  let params = [];

  if (search) {
      query += ` AND (users.full_name LIKE ? OR books.title LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
  }

  query += ` LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  db.all(query, params, (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
      } else {
          res.json(rows);
      }
  });
});


//for management delete all loan records
app.delete('/loans/all', (req, res) => {
  const query = 'DELETE FROM loans'

  db.run(query, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'all deleted successfully' });
    }
  });
});
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});