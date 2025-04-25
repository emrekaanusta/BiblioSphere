import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import Navbar from '../NavigationBar/Navbar';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAgreement, setShowAgreement] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    // Password match check
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords don't match!");
      return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // User agreement check
    if (!formData.agreed) {
      setErrorMessage('You must accept the user agreement.');
      return;
    }

    // Backend call
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        password: formData.password
      })
    };

    fetch('http://localhost:8080/register', requestOptions)
      .then(async (response) => {
        const result = await response.text();
        if (!response.ok) {
          setErrorMessage(result);
          return;
        }
        setSuccessMessage(result);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
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
            <h3>Create Account</h3>

            {errorMessage && <div className="error-box">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="input-group">
              <label>Name</label>
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
              <label>Surname</label>
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
              <label>Email</label>
              <input
                type="text"
                name="email"
                className="register-input"
                placeholder="enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                autoCapitalize="none"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="register-input"
                placeholder="enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoCapitalize="none"
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="register-input"
                placeholder="confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoCapitalize="none"
              />
            </div>

            <div className="checkboxContainer">
              <input
                type="checkbox"
                name="agreed"
                checked={formData.agreed}
                onChange={handleChange}
              />
              <label
                onClick={() => setShowAgreement(true)}
                style={{ cursor: 'pointer', marginLeft: '10px', textDecoration: 'underline', color: 'blue' }}
              >
                I Accept The User Agreement
              </label>
            </div>

            <input type="submit" value="Register Now" className="register-btn" />

            <p>Already Have An Account? <Link to="/login">Sign In</Link></p>
          </form>
        </div>
      </div>

      {showAgreement && (
        <div className="agreementPopup">
          <div className="agreementContent">
            <h3>User Agreement</h3>
            <p>This is a sample user agreement. By signing up, you agree to our terms and conditions.</p>
            <button onClick={() => setShowAgreement(false)} className="closeAgreementBtn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
