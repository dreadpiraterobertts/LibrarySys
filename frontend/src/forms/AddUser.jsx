import { useState, useEffect } from "react";
import "./adduser.css";

const AddUser = ({ userToEdit }) => {
  const [userData, setUserData] = useState({
    full_name: "",
    user_name: "",
    phone_number: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  // Populate form if userToEdit exists (editing mode)
  useEffect(() => {
    if (userToEdit) {
      setUserData(userToEdit);
    }
  }, [userToEdit]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors

    try {
      const response = await fetch(
        userToEdit ? `http://localhost:5000/users/${userToEdit.id}` : "http://localhost:5000/users",
        {
          method: userToEdit ? "PUT" : "POST", // Use PUT for updates, POST for new users
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save user");
      }

      alert(userToEdit ? "User updated successfully!" : "User added successfully!");
 // Close the form after successful submission
    } catch (error) {
      setErrorMessage(error.message);
      console.error("Error saving user:", error.message);
    }
  };

  return (
    <div className="adduser-form-container">
      <h2>{userToEdit ? "Edit User" : "Add New User"}</h2>
      <form className="adduser-form" onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input type="text" name="full_name" value={userData.full_name} onChange={handleChange} required />
        </div>

        <div>
          <label>User Name:</label>
          <input type="text" name="user_name" value={userData.user_name} onChange={handleChange} required  />
        </div>

        <div>
          <label>Phone Number:</label>
          <input type="text" name="phone_number" value={userData.phone_number} onChange={handleChange} required />
        </div>

        <button className="addbook-btn" type="submit">
          {userToEdit ? "Update User" : "Add User"}
        </button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default AddUser;
