import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './issueloan.css'

const IssueLoan = (props) => {
  const [userId, setUserId] = useState('');
  const [bookId, setBookId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('http://localhost:5000/users');
      const data = await response.json();
      setUsers(data.map((user) => ({ value: user.id, label: user.full_name })));
    };

    const fetchBooks = async () => {
      const response = await fetch('http://localhost:5000/books');
      const data = await response.json();
      setBooks(data.map((book) => ({ value: book.id, label: book.title })));
    };

    fetchUsers();
    fetchBooks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !bookId || !dueDate) {
      setMessage('Please fill out all fields.');
      return;
    }

    if(confirm("Issuing a loan ... do you want to continue?")){
      try {
        const response = await fetch('http://localhost:5000/loans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId, book_id: bookId, due_date: dueDate }),
        });
  
        const data = await response.json();
        if (response.ok) {
          setMessage('Loan created successfully!');
        } else {
          setMessage(`Error: ${data.error}`);
        }
      } catch (err) {
        console.error('Error submitting loan:', err);
        setMessage('Error creating loan.');
      }
    }
  };

  return (
    <div className="loan-form-container">
      <h2>Create Loan</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userId">User</label>
          <Select
            id="userId"
            value={users.find((user) => user.value === userId)}
            onChange={(selectedOption) => setUserId(selectedOption?.value || '')}
            options={users}
            placeholder="Select User"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bookId">Book</label>
          <Select
            id="bookId"
            value={books.find((book) => book.value === bookId)}
            onChange={(selectedOption) => setBookId(selectedOption?.value || '')}
            options={books}
            placeholder="Select Book"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <button class="issue" type="submit">Issue Loan</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default IssueLoan;
