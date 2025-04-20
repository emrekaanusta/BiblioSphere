import React, { useState } from "react";

const RatingForm = ({ productId, orderId, onRated }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      productId,
      orderId,
      rating,
      comment,
    };

    try {
      const res = await fetch("http://localhost:8080/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Auth from token
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onRated?.(); // 👈 Notify parent (e.g., Receipt page) to update UI
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
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            onClick={() => setRating(s)}
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
