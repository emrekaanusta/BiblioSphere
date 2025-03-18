import React from "react";

const CreatePassword = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Create a New Password</h2>
      <p>Enter your new password below:</p>
      <input type="password" placeholder="New Password" style={{ padding: "10px", margin: "10px" }} />
      <br />
      <button style={{ padding: "10px 20px", marginTop: "10px", cursor: "pointer" }}>Submit</button>
    </div>
  );
};

export default CreatePassword;
