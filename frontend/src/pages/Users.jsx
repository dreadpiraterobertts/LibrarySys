import React, { useState, useEffect } from 'react';
import './users.css';
import AddUser from '../forms/AddUser';

const Users = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 15;
  const [isLastPage, setIsLastPage] = useState(false);
  const [showUser,setShowUser] = useState(null)
  // State to track editing user
  
  const fetchUsers = async () => {
    try {
      let url = `http://localhost:5000/users?search=${search}`;
      if (!search) {
        url += `&page=${page}&limit=${limit}`;
      }
  
      const response = await fetch(url);
      const data = await response.json();
      
      setUsers(data);
      if (!search) {
        setIsLastPage(data.length < limit);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [search, page, limit,showUser]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleEditUser = (id,full_name,user_name,phone_number) => {
    
    if(id){
      setShowUser({
        id:id,
        full_name:full_name,
        user_name:user_name,
        phone_number:phone_number
      })
    }else{
      setShowUser(null)
      }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${id}`, {
        method: "DELETE",
      });
  
      // Check if the response is OK (status code 200-299)
      if (!response.ok) {
        // Try to parse the error message from the response
        let errorMessage = "Failed to delete user";
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
      alert("User deleted successfully!",data);
      fetchUsers();
    
    } catch (error) {
      // Show error message
      alert(error.message || "An error occurred while deleting the user.");
      console.error("Delete error:", error); // Optional: Log the error for debugging
    }
  };

  return (
    <div className="user-container">
      <h2 className="user-title">User Table</h2>

      <div className="user-controls">
        <input
          type="text"
          placeholder="Search user"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Full Name</th>
            <th>User Name</th>
            <th>Phone No</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr key={user.id}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{user.full_name}</td>
                <td>{user.user_name}</td>
                <td>{user.phone_number}</td>
                <td>
                  <button onClick={() => handleEditUser(user.id,user.full_name,user.user_name,user.phone_number)}>Edit</button> 
                  <button onClick={()=>deleteUser(user.id)}>Del</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Prev
        </button>
        <span>Page {page}</span>
        <button onClick={() => handlePageChange(page + 1)} disabled={isLastPage}>
          Next
        </button>
      </div>

      {/* Show AddUser when editing a user */}
      {showUser && (
         <div className="floating-form-overlay" onClick={()=>{handleEditUser(null)}}>
         <div className="floating-form" onClick={(e) => e.stopPropagation()}>
           <button className="close-button" onClick={()=>{handleEditUser(null)}}>
             X
           </button>
             <AddUser userToEdit={showUser}/>
         </div>
       </div>
      )}
    </div>
  );
};

export default Users;
