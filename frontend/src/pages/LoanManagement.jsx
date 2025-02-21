import React, { useState, useEffect } from "react";
import "./loanmanagement.css";

const LoanManagement = () => {
  const [filter, setFilter] = useState("Current");
  const [search, setSearch] = useState("");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const loansPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  const Message = ({message,color}) =>{
    return(
      <p className={color}>{message}</p>
    )
  }
  const checkStatus = (dueDate,returnDate) =>{
    const today =  new Date().toISOString().split("T")[0]
    if(!returnDate && dueDate < today){
      return <Message message={"Over Due"} color={"red"} />
    }else if(returnDate){
      return  <Message message={"Returned"} color={"blue"} />
    }else{
      return  <Message message={"On loan"} color={"green"} />
    }
  }
  

  const fetchLoans = async () => {
    setLoading(true);
    try {
      let endpoint = "/loans";
      if (filter === "Current") endpoint = "/loans/current";
      if (filter === "Overdue") endpoint = "/loans/overdue";
      if (filter === "Returned") endpoint = "/loans/returned";

      const response = await fetch(`http://localhost:5000${endpoint}?search=${search}&page=${currentPage}`);
      const data = await response.json();
      setLoans(data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLoans();
  }, [filter, search, currentPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const returnBook = async (id, book, user) => {
    try {
      const response = await fetch(`http://localhost:5000/loans/${id}/return`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ return_date: new Date().toISOString().split("T")[0] }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to return book");
      }
      fetchLoans();
      alert(`Book returned successfully: ID ${id}, Book: ${book}, User: ${user}`);
    } catch (error) {
      console.error("Error returning book:", error.message);
    }
  };

  return (
    <div className="loan-container">
      <h2 className="loan-title">Loan Table</h2>
      <div className="loan-controls">
        <input
          className="loansearch"
          type="text"
          placeholder="Search user or book"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="Current">Current</option>
          <option value="Overdue">Overdue</option>
          <option value="Returned">Returned</option>
          <option value="LoanHistory">Loan history</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="loan-table">
            <thead>
              <tr>
                <th>No</th>
                <th>User Name</th>
                <th>Book Title</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.length > 0 ? (
                loans.map((loan, index) => (
                  <tr key={loan.id}>
                    <td>{(currentPage - 1) * loansPerPage + index + 1}</td>
                    <td>{loan.full_name}</td>
                    <td>{loan.title}</td>
                    <td>{loan.issue_date}</td>
                    <td>{loan.due_date}</td>
                    <td>{loan.return_date || "Pending"}</td>
                    <td>
                      {checkStatus(loan.due_date, loan.return_date)}
                    </td>
                    <td>
                      {!loan.return_date && (
                        <button className="return-btn" onClick={() => returnBook(loan.id, loan.title, loan.full_name)}>
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="pagination">
            {[...Array(totalPages).keys()].map((number) => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                className={currentPage === number + 1 ? "active" : ""}
              >
                {number + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LoanManagement;