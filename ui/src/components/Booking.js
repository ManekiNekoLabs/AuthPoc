import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Booking.css';

function Booking() {
  const { authToken, idToken } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initiateSSOFlow = async () => {
      if (!authToken || !idToken) {
        setError('Missing authentication or ID token');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Initiating SSO with token:', idToken);

        const response = await fetch('http://localhost:8000/initiate-sso', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          credentials: 'include',
          body: JSON.stringify({ 
            session: idToken,
            portal: 'sensablehealth',
            relayState: 'ContentSection-be859525-1c03-411e-be57-2a20bb114061'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to initiate SSO');
        }

        const data = await response.json();
        console.log('SSO Response:', data);
        
        // Redirect to AWS IAM Identity Center
        window.location.href = data.redirectUrl;

      } catch (error) {
        console.error('SSO flow error:', error);
        setError(`SSO Error: ${error.message}`);
        setIsLoading(false);
      }
    };

    initiateSSOFlow();
  }, [authToken, idToken]);

  if (isLoading) {
    return <div className="booking-loading">Initiating SSO...</div>;
  }

  if (error) {
    return (
      <div className="booking-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  return null;
}

export default Booking;
