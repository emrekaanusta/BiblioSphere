import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import Navbar from '../NavigationBar/Navbar';

const Register = () => {
  const navigate = useNavigate();

  // Store form data in state
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Store messages in state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset messages before submission
    setErrorMessage('');
    setSuccessMessage('');

    // Check for matching passwords on the client side
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords don't match!");
      return;
    }

    // Prepare the data to match what your backend expects
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // If your backend expects these exact fields:
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        password: formData.password
      })
    };

    fetch('http://localhost:8080/register', requestOptions)
      .then(async (response) => {
        const result = await response.text(); // get response as text
        if (!response.ok) {
          // The server responded with an error status
          setErrorMessage(result); // e.g. "User already exists" or "Password must be longer..."
          return;
        }
        // Success!
        setSuccessMessage(result); // e.g. "User registered successfully"
        // Redirect to login page after a short delay or immediately
        navigate('/login');
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage('An error occurred while registering. Please try again.');
      });
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="register-container">
        <div className="register-box">
          <form onSubmit={handleSubmit}>
            <h3>create account</h3>

            {/* Show error or success messages here */}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="input-group">
              <label>name</label>
              <input
                type="text"
                name="name"
                className="register-input"
                placeholder="enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                autoCapitalize="none"
              />
            </div>

            <div className="input-group">
              <label>surname</label>
              <input
                type="text"
                name="surname"
                className="register-input"
                placeholder="enter your surname"
                value={formData.surname}
                onChange={handleChange}
                required
                autoCapitalize="none"
              />
            </div>

            <div className="input-group">
              <label>email</label>
              <input
                type="email"
                name="email"
                className="box"
                placeholder="enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                autoCapitalize="none"
              />
            </div>

            <div className="input-group">
              <label>password</label>
              <input
                type="password"
                name="password"
                className="box"
                placeholder="enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoCapitalize="none"
              />
            </div>

            <div className="input-group">
              <label>confirm password</label>
              <input
                type="password"
                name="confirmPassword"
                className="box"
                placeholder="confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoCapitalize="none"
              />
            </div>

            <input type="submit" value="register now" className="register-btn" />

            <p>already have an account? <Link to="/login">sign in</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
