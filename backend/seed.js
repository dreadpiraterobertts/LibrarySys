const sqlite3 = require('sqlite3').verbose();
const { faker } = require('@faker-js/faker');

const db = require('./database');

db.serialize(() => {
  console.log("Seeding database...");

  // Clear tables before inserting new data
  db.run("DELETE FROM users");
  db.run("DELETE FROM books");

  const stmtUsers = db.prepare("INSERT INTO users (full_name, user_name, phone_number) VALUES (?, ?, ?)");
  const stmtBooks = db.prepare("INSERT INTO books (title, author, year, bar_code, total_copies, avail_copies) VALUES (?, ?, ?, ?, ?, ?)");

  // Insert 10 random users
  for (let i = 0; i < 100; i++) {
    stmtUsers.run(
      faker.person.fullName(),
      faker.internet.username(),
      faker.phone.number() // Generates a random phone number
    );
  }

  // Insert 10 random books
  for (let i = 0; i < 100; i++) {
    const totalCopies = faker.number.int({ min: 5, max: 20 }); // Random total copies between 5 and 20
    const availCopies = totalCopies // Available copies cannot exceed total copies

    stmtBooks.run(
      faker.lorem.words(3), // Generates a random book title
      faker.person.fullName(), // Generates a random author name
      faker.date.past({ years: 50 }).getFullYear(), // Random year within the past 50 years
      faker.number.int({min:100,max:500}),
      totalCopies,
      availCopies
    );
  }

  stmtUsers.finalize();
  stmtBooks.finalize();
  console.log("Database seeded successfully!");
});

db.close();