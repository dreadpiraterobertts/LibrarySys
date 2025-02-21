import React, { useState, useEffect } from "react";
import "./dashboard.css";
import IssueLoan from "../forms/IssueLoan";
import AddBook from "../forms/AddBook"
import AddUser from "../forms/AddUser"

const Dashboard = () => {
  const [showIssue, setShowIssue] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [books,setBooks] = useState(0)
  const [current,setCurrent] = useState(0)
  const [overdue,setOverdue] = useState(0)
  
  const handleIssueLoanClick = () => {
    setShowIssue(!showIssue);
  };

  const handleAddBook = () => {
    setShowBook(!showBook);
  };

  const handleAddUser = () => {
    setShowUser(!showUser);
  };

 
  useEffect(()=>{
    const fetchBooks = async () => {
      const response = await fetch('http://localhost:5000/books');
      const data = await response.json();
      setBooks(data.length)
    }
    const fetchCurrent = async ()=>{
      const response = await fetch('http://localhost:5000/loans/current')
      const data = await response.json()
      setCurrent(data.length)
    }
    const fetchOverdue = async () =>{
      const response = await fetch('http://localhost:5000/loans/overdue')
      const data = await response.json()
      setOverdue(data.length) 
    }
    fetchCurrent()
    fetchBooks()
    fetchOverdue()
  },[showBook,showUser,showIssue])

 
  return (
    <div>
      <div className="dashboard">
        <div className="card-container">
          <div className="card blue">
            <h2>Total books in Library</h2>
            <p>{books}</p>
          </div>
          <div className="card purple">
            <h2>Currently in Loan</h2>
            <p>{current}</p>
          </div>
          <div className="card red">
            <h2>Overdue loans</h2>
            <p>{overdue}</p>
          </div>
        </div>
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <button onClick={handleAddBook}>Add new book</button>
          <button onClick={handleAddUser}>Add new user</button>
          <button onClick={handleIssueLoanClick}>Issue loan</button>
        </div>
      </div>

      {showIssue && (
        <div className="floating-form-overlay" onClick={handleIssueLoanClick}>
          <div className="floating-form" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleIssueLoanClick}>
              X
            </button>
            <IssueLoan />
          </div>
        </div>
      )}

      {showBook && (
        <div className="floating-form-overlay" onClick={handleAddBook}>
          <div className="floating-form" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleAddBook}>
              X
            </button>
              <AddBook/>
          </div>
        </div>
      )}

      {showUser && (
        <div className="floating-form-overlay" onClick={handleAddUser}>
          <div className="floating-form" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleAddUser}>
              X
            </button>
            <AddUser />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
