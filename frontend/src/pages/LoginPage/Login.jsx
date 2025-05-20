// src/pages/Login/Login.jsx
import React, { useState } from "react";
import "./Login.css";
import Navbar from "../NavigationBar/Navbar";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const navigate                = useNavigate();

  // if user has typed exactly the admin username, turn off HTML5 email-check
  const isAdminAttempt = email === process.env.REACT_APP_ADMIN_USERNAME;

  const handleLogin = async (e) => {
    e.preventDefault();

    // ——— 1) Admin bypass ———
    if (
      email === process.env.REACT_APP_ADMIN_USERNAME &&
      password === process.env.REACT_APP_ADMIN_PASSWORD
    ) {
      localStorage.setItem("isPM", "true");               // flag them as product‐manager
      localStorage.setItem("token", "fake-admin-token");  // so other code thinks “logged in”
      return navigate("/pm/comments");
    }

    // ——— 2) Normal login flow ———
    try {
      const res = await fetch("http://localhost:8080/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const token = await res.text();
      if (!token) throw new Error("No token returned");

      // remove any old admin flag
      localStorage.removeItem("isPM");
      // store your real token & email
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", email);

      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2>Login</h2>
          <form onSubmit={handleLogin} noValidate={isAdminAttempt}>
            <div className="input-group">
              <label>Email</label>
              <input
                type={isAdminAttempt ? "text" : "email"}
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

            <button type="submit" className="login-btn">
              Login
            </button>

            <p>
              Don’t have an account? <Link to="/register">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
