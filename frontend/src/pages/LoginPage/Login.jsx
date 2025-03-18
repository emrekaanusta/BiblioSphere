import React, { useState } from "react";
import "./Login.css"; // Login için CSS
import Navbar from "../NavigationBar/Navbar";
import {Link} from "react-router-dom"; // Navbar'ı ekledik

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Logging in with Email: ${email}, Password: ${password}`);
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
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
