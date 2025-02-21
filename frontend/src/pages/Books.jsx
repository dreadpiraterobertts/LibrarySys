import React, { useEffect, useState } from "react";
import "./books.css";
import AddBook from "../forms/AddBook";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [showAvailable, setShowAvailable] = useState(false);
  const [page, setPage] = useState(1);
  let limit = 15; // Number of books per page
  const [isLastPage, setIsLastPage] = useState(false);
   const [showBook,setShowBook] = useState(null)

  useEffect(() => {
    fetchBooks();
  }, [search, showAvailable, page]); // Fetch when filters change
  const fetchBooks = async () => {
    try {
      const endpoint = showAvailable ? "/books/available" : "/books";
      let url = `http://localhost:5000${endpoint}?search=${search}`;
  
      // Only add pagination if there's no search term
      if (!search) {
        url += `&page=${page}&limit=${limit}`;
      }
  
      const response = await fetch(url);
  
      if (!response.ok) throw new Error("Failed to fetch books");
  
      const data = await response.json();
      setBooks(data);
  
      // Check if it's the last page only when paginating
      if (!search) {
        setIsLastPage(data.length < limit);
      }
      
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };
  
  const handleEditBook  = (id,title,author,year,bar_code,total_copies,avail_copies) =>{
    if(id){
      setShowBook({
        id:id,
        title:title,
        author:author,
        year:year,
        bar_code:bar_code,
        total_copies:total_copies,
        
      })
      console.log({
        id:id,
        title:title,
        author:author,
        year:year,
        bar_code:bar_code,
        total_copies:total_copies,
        
      })
    }else{
      setShowBook(null)
      }
  }
  
const deleteBook = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/books/${id}`, {
      method: "DELETE",
    });

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      // Try to parse the error message from the response
      let errorMessage = "Failed to delete book";
      try {
        const data = await response.json();
        errorMessage = data.error || errorMessage;
      } catch (error) {
        // If the response is not JSON, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // If the response is OK, parse the JSON
    const data = await response.json();

    // Show success message
    alert("Book deleted successfully!",data);
    fetchBooks()
  
  } catch (error) {
    // Show error message
    alert(error.message || "An error occurred while deleting the book.");
    console.error("Delete error:", error); // Optional: Log the error for debugging
  }
};

  return (
    <div className="book-container">
      <h2 className="book-title">Books Table</h2>

      <div className="book-controls">
        <input
          type="text"
          placeholder="Search for a book"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div>
          <input
            type="checkbox"
            id="show"
            checked={showAvailable}
            onChange={(e) => setShowAvailable(e.target.checked)}
          />
          <label htmlFor="show">Show books with available copies</label>
        </div>
      </div>

      <table className="book-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Title</th>
            <th>Author</th>
            <th>Year</th>
            <th>Bar Code</th>
            <th>Total Copies</th>
            <th>Avail Copies</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((book, index) => (
              <tr key={book.id}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.year || "N/A"}</td>
                <td>{book.bar_code}</td>
                <td>{book.total_copies}</td>
                <td>{book.avail_copies}</td>
                <td>
                  <button onClick={() => handleEditBook(book.id,book.title,book.author,book.year,book.bar_code,book.total_copies)}>Edit</button> 
                  <button onClick={()=>{
                    deleteBook(book.id)
                  }}>Del</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No books found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>Page {page}</span>
        <button disabled={isLastPage} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {showBook && (
         <div className="floating-form-overlay" onClick={()=>{handleEditBook(null)}}>
         <div className="floating-form" onClick={(e) => e.stopPropagation()}>
           <button className="close-button" onClick={()=>{handleEditBook(null)}}>
             X
           </button>
             <AddBook bookToEdit={showBook}/>
         </div>
       </div>
      )}
    </div>
  );
};

export default Books;
