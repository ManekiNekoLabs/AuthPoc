// src/components/Dashboard.js
import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { firstName } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleBookSession = () => {
    navigate('/booking');
  };

  return (
    <div className="dashboard-container">
      <h2>Hey, {firstName}!</h2>
      <p>You have successfully signed in and validated your account.</p>
      <div className="book-session-container">
        <h3>Book Intro coach session</h3>
        <button className="book-session-button" onClick={handleBookSession}>Book Here</button>
      </div>
    </div>
  );
}

export default Dashboard;
