import logo from './logo.svg';
import './App.css';
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import ValidationCode from './components/ValidationCode';
import Dashboard from './components/Dashboard';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Booking from './components/Booking';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route
            path="/validate"
            element={
              <ProtectedRoute>
                <ValidationCode />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireValidation>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/booking" 
            element={
              <ProtectedRoute requireValidation>
                <Booking />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
