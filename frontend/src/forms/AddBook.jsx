import React, { useState, useEffect } from "react";
import "./addbook.css";

const AddBook = ({ bookToEdit}) => {
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    year: "",
    bar_code: "",
    total_copies: "",
  });

  // Populate form if editing an existing book
  useEffect(() => {
    if (bookToEdit) {
      setBookData({
        title: bookToEdit.title || "",
        author: bookToEdit.author || "",
        year: bookToEdit.year || "",
        bar_code: bookToEdit.bar_code || "",
        total_copies: bookToEdit.total_copies || "",
      });
    }
  }, [bookToEdit]);

  const handleChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = bookToEdit
        ? `http://localhost:5000/books/${bookToEdit.id}` // Update existing book
        : "http://localhost:5000/books"; // Add new book

      const method = bookToEdit ? "PUT" : "POST"; // Use PUT for updates, POST for new books

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save book");
      }

      alert(bookToEdit ? "Book updated successfully!" : "Book added successfully!");
      onClose(); // Close the form after successful submission
    } catch (error) {
      console.error("Error saving book:", error.message);
    }
  };

  return (
    <div className="addbook-form-container">
      <h2>{bookToEdit ? "Edit Book" : "Add New Book"}</h2>
      <form className="addbook-form" onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input type="text" name="title" value={bookData.title} onChange={handleChange} required />
        </div>

        <div>
          <label>Author:</label>
          <input type="text" name="author" value={bookData.author} onChange={handleChange} required />
        </div>

        <div>
          <label>Year:</label>
          <input type="number" name="year" value={bookData.year} onChange={handleChange} required />
        </div>

        <div>
          <label>Barcode:</label>
          <input type="text" name="bar_code" value={bookData.bar_code} onChange={handleChange} required />
        </div>

        <div>
          <label>Total Copies:</label>
          <input type="number" name="total_copies" value={bookData.total_copies} onChange={handleChange} required />
        </div>

        <button className="addbook-btn" type="submit">
          {bookToEdit ? "Update Book" : "Add Book"}
        </button>
      </form>
    </div>
  );
};

export default AddBook;
