import React, { useState, useEffect } from 'react';
import './BookRatingSection.css';
import StarRating from './StarRating';

const maskUsername = (name) => {
  if (!name) return 'Anonymous';
  const parts = name.split(' ');
  if (parts.length < 2) return name[0] + '*'.repeat(name.length - 1);
  
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const maskedFirstName = firstName[0] + '*'.repeat(firstName.length - 1);
  const maskedLastName = lastName[0] + '*'.repeat(lastName.length - 1);
  
  return `${maskedFirstName} ${maskedLastName}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const BookRatingSection = ({ bookId, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [showRatingRequired, setShowRatingRequired] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Always fetch reviews, no auth needed
        const productRes = await fetch(`http://localhost:8080/api/products/${bookId}`);
        if (productRes.ok) {
          const product = await productRes.json();
          console.log('Product data:', product);
          const reviewsData = product.reviews || product.review || product.ratings || [];
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          setAverageRating(product.rating || 0);
        }

        // Check if user can rate (logged in and has purchased)
        const token = localStorage.getItem('token');
        if (token) {
          const canRateRes = await fetch(
            `http://localhost:8080/api/ratings/can-rate?productId=${bookId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (canRateRes.ok) {
            const { canRate } = await canRateRes.json();
            setCanRate(canRate);
          }

          // Check if user has already rated
          const ratedRes = await fetch(
            `http://localhost:8080/api/ratings/check?productId=${bookId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (ratedRes.ok) {
            const hasRated = await ratedRes.json();
            setHasRated(hasRated);
          }
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };

    fetchReviews();
  }, [bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      return;
    }

    if (!canRate) {
      return;
    }

    if (!rating) {
      setShowRatingRequired(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8080/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: bookId,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        setHasRated(true);
        onRatingSubmitted?.();
        // Refresh reviews
        const productRes = await fetch(`http://localhost:8080/api/products/${bookId}`);
        if (productRes.ok) {
          const product = await productRes.json();
          const reviewsData = product.reviews || product.review || product.ratings || [];
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          setAverageRating(product.rating || 0);
        }
      } else {
        const errText = await res.text();
        alert('Failed to submit rating: ' + errText);
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
      alert('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rating-section" id="reviews">
      <div className="rating-header">
        <h3>Ratings & Reviews</h3>
        <div className="average-rating">
          <StarRating rating={averageRating} />
          <span className="rating-count">
            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      {!hasRated && canRate && (
        <form className="rating-form" onSubmit={handleSubmit}>
          <div className="star-input">
            <span>Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => {
                  setRating(star);
                  setShowRatingRequired(false);
                }}
                className={`star ${rating >= star ? 'filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
          {showRatingRequired && (
            <div className="notification warning">
              Please select a rating before submitting your review.
            </div>
          )}

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this book..."
            className="comment-box"
          />

          <button
            type="submit"
            className="submit-rating-btn"
            disabled={isSubmitting}
          >
            Submit Rating
          </button>
        </form>
      )}

      {!localStorage.getItem('token') && (
        <div className="notification info">
          Please <a href="/login">login</a> to rate and review this book.
        </div>
      )}

      {localStorage.getItem('token') && !canRate && (
        <div className="notification info">
          You need to purchase and receive this book before you can rate it.
        </div>
      )}

      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${review.userName || 'Anonymous'}&background=random`} 
                    alt="User avatar" 
                    className="reviewer-avatar"
                  />
                  <div className="reviewer-details">
                    <span className="reviewer-name">{maskUsername(review.userName || 'Anonymous')}</span>
                    <span className="review-date">{formatDate(review.date || new Date())}</span>
                  </div>
                </div>
                <StarRating rating={review.rating || 0} />
              </div>
              <p className="review-text">{review.comment || review.text || review}</p>
            </div>
          ))
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default BookRatingSection; 