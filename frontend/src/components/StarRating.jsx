import React from 'react';
import './StarRating.css';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="stars">
      {[...Array(5)].map((_, index) => {
        if (index < fullStars) {
          return <i key={index} className="fas fa-star filled"></i>;
        } else if (index === fullStars && hasHalfStar) {
          return <i key={index} className="fas fa-star-half-alt filled"></i>;
        } else {
          return <i key={index} className="fas fa-star"></i>;
        }
      })}
      <span className="rating-value">({rating.toFixed(1)})</span>
    </div>
  );
};

export default StarRating; 