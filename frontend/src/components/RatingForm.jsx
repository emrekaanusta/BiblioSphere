import React, { useState } from "react";

const RatingForm = ({ productId, orderId, onRated }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setError("Please select a rating before submitting.");
      return;
    }

    const payload = {
      productId,
      orderId,
      rating,
      comment: comment.trim() || null, // allow empty or null comments
    };

    try {
      const res = await fetch("http://localhost:8080/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onRated?.();
      } else {
        const errText = await res.text();
        alert("Rating failed: " + errText);
      }
    } catch (err) {
      console.error("Rating failed", err);
      alert("Something went wrong.");
    }
  };

  return (
    <form className="rating-form" onSubmit={handleSubmit}>
      <div className="star-input">
        <span>Your Rating:</span>
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            onClick={() => {
              setRating(s);
              setError("");
            }}
            style={{
              cursor: "pointer",
              color: rating >= s ? "#facc15" : "#ccc",
              fontSize: "24px",
            }}
          >
            ★
          </span>
        ))}
      </div>

      {error && <div className="rating-error" style={{ color: "red" }}>{error}</div>}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment (optional)"
        className="comment-box"
      />

      <button type="submit" className="submit-rating-btn">
        Submit Rating
      </button>
    </form>
  );
};

export default RatingForm;
