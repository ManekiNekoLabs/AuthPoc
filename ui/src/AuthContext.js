// src/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [isValidated, setIsValidated] = useState(false);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      setIsAuthenticated,
      authToken,
      setAuthToken,
      idToken,
      setIdToken,
      userId,
      setUserId,
      firstName,
      setFirstName,
      isValidated,
      setIsValidated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
