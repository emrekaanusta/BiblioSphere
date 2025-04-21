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

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  reviewsList: {
    marginTop: '20px',
  },
  reviewItem: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#fff',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  reviewerInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  reviewerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
  },
  reviewerDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  reviewerName: {
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  reviewDate: {
    color: '#666',
    fontSize: '0.9em',
    marginBottom: '4px',
  },
  reviewerRating: {
    marginTop: '4px',
  },
  reviewText: {
    marginTop: '10px',
    color: '#333',
    lineHeight: '1.5',
  },
  noReviews: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '20px',
  },
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
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch both product and ratings data
        const [productRes, ratingsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/products/${bookId}`),
          fetch(`http://localhost:8080/api/ratings/product/${bookId}`, {
            headers: headers
          })
        ]);

        console.log('Product Response Status:', productRes.status);
        console.log('Ratings Response Status:', ratingsRes.status);

        if (productRes.ok && ratingsRes.ok) {
          const product = await productRes.json();
          const ratings = await ratingsRes.json();
          
          console.log('Raw Product Data:', JSON.stringify(product, null, 2));
          console.log('Raw Ratings Data:', JSON.stringify(ratings, null, 2));

          // Handle ratings data
          let processedReviews = [];
          if (Array.isArray(ratings)) {
            processedReviews = ratings;
          } else if (ratings && typeof ratings === 'object') {
            processedReviews = [ratings];
          }

          console.log('Processed Reviews:', JSON.stringify(processedReviews, null, 2));
          console.log('Review objects:', processedReviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            submittedAt: review.submittedAt,
            userName: review.userName
          })));
          
          setReviews(processedReviews);
          setAverageRating(product.rating || 0);
        } else {
          console.error('Failed to fetch data:', {
            productStatus: productRes.status,
            ratingsStatus: ratingsRes.status
          });
          // If we get a 403, set empty reviews but don't show an error
          if (ratingsRes.status === 403) {
            setReviews([]);
          }
        }

        // Check if user can rate (logged in and has purchased)
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
          } else if (canRateRes.status === 403) {
            setCanRate(false);
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

      <div style={styles.container}>
        <div style={styles.reviewsList}>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} style={styles.reviewItem}>
                <div style={styles.reviewHeader}>
                  <div style={styles.reviewerInfo}>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${review.userName || 'Anonymous'}&background=random`} 
                      alt="User avatar" 
                      style={styles.reviewerAvatar}
                    />
                    <div style={styles.reviewerDetails}>
                      <span style={styles.reviewerName}>{maskUsername(review.userName || 'Anonymous')}</span>
                      <span style={styles.reviewDate}>{formatDate(review.submittedAt || new Date())}</span>
                      <div style={styles.reviewerRating}>
                        <StarRating rating={Number(review.rating) || 0} readOnly />
                      </div>
                    </div>
                  </div>
                </div>
                <p style={styles.reviewText}>
                  {typeof review.comment === 'string' ? review.comment : 'No comment provided'}
                </p>
              </div>
            ))
          ) : (
            <p style={styles.noReviews}>No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookRatingSection; 