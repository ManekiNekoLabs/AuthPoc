// src/components/ValidationCode.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function ValidationCode() {
  const { authToken, userId, setIsValidated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(180); // 3 minutes in seconds
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const apiUrl = 'http://localhost:8000/user/mfalogin'; // Updated endpoint

    const payload = {
      mfaCode: code,
      portal: 'participant', // Adjust if needed
      session: authToken, // Use the session as authToken
      userId: userId,
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Validation failed');
      }

      const data = await response.json();
      setIsValidated(true);
      navigate('/dashboard'); // Redirect to dashboard after successful validation
    } catch (err) {
      console.error('Validation Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    // Implement the resend logic, possibly calling an API endpoint
    const apiUrl = 'https://userapi.sensablehealth.net/user/resend-code'; // Replace with actual endpoint

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({}), // Adjust payload as needed
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Resend failed');
      }

      alert('A new code has been sent to your phone.');
      setTimer(180); // Reset timer
    } catch (err) {
      console.error('Resend Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="validation-container">
      <h2>Enter Validation Code</h2>
      <form onSubmit={handleSubmit} className="validation-form">
        <div className="input-group">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength="6"
            required
            className="input-field"
            placeholder="Enter 6-digit code"
          />
        </div>
        <p>Single-use code will be valid for 3 minutes.</p>
        <p>Time remaining: {formatTime(timer)}</p>
        {error && <p className="error-message">{error}</p>}
        <div className="button-group">
          <button type="submit" disabled={loading || timer === 0} className="submit-button">
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="resend-button"
          >
            {loading ? 'Resending...' : 'Resend Text Message'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ValidationCode;
