// src/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState('');

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      setIsAuthenticated,
      isValidated,
      setIsValidated,
      authToken,
      setAuthToken,
      userId,
      setUserId,
      firstName,
      setFirstName
    }}>
      {children}
    </AuthContext.Provider>
  );
};
