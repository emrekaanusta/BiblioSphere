import React from "react";
import { Link } from "react-router-dom";
import "./Login.css"; // Import CSS file

function LoginPage() {
  return (
    <div className="page-container">
      <div className="login-box">
        <h2>Login</h2>
        <form>
          <div className="input-group">
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>

        {/* Forgot Password & Create Password Buttons */}
        <div className="link-container">
          <Link to="/forgot-password" className="link-btn">Forgot Password?</Link>
          <Link to="/create-password" className="link-btn">Create Password</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
