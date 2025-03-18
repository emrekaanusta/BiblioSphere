import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Password reset link sent to: ${email}`);
    // Backend'e istek göndermek için buraya API çağrısı eklenebilir.
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Forgot Password</h2>
      <p>Enter your email address to reset your password.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", margin: "10px", width: "250px" }}
        />
        <br />
        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
