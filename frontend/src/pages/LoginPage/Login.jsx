import React, { useState } from "react";
import "./Login.css"; // Login için CSS
import Navbar from "../NavigationBar/Navbar";
import {Link } from "react-router-dom"; // Navbar'ı ekledik

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    };

    fetch('http://localhost:8080/login', requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Invalid credentials');
          }
          return response.text();
        })
        .then((token) => {
          if (token && token.length > 0) {
            global.token = token;
            console.log("Success", "Login successful!");
            //TODO:Loginden sonra hangi sayfaya yönlenecek ?
          } else {
            console.log("Error", "Invalid credentials");
          }
        })
        .catch((error) => {
          console.error(error);
        });
  };
  return (
    <div className="page-container">
      <Navbar /> {/* Navbar sayfanın en üstüne eklendi */}
      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                placeholder="enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
                autoCapitalize="none"
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                placeholder="enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
                autoCapitalize="none"
              />
            </div>
            <button type="submit" className="login-btn">Login</button>
            <p>Don't you have an account ? <Link to="/register">sign up</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
