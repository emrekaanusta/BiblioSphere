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

const getInitials = (name) => {
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    return userEmail[0].toUpperCase();
  }
  if (!name) return 'A';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer',
    padding: '4px 8px',
    fontSize: '0.9em',
  },
  editButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    padding: '4px 8px',
    fontSize: '0.9em',
    marginRight: '8px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.8em',
    marginLeft: '8px',
  },
  pendingStatus: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  visibleStatus: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
};

const BookRatingSection = ({ bookId, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [book, setBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [showRatingRequired, setShowRatingRequired] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

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

        if (productRes.ok) {
          const product = await productRes.json();
          setBook(product);
          setAverageRating(product.rating || 0);
        }

        if (ratingsRes.ok) {
          const text = await ratingsRes.text();
          let processedReviews = [];
          if (text) {
            const ratings = JSON.parse(text);
            if (Array.isArray(ratings)) {
              processedReviews = ratings;
            } else if (ratings && typeof ratings === 'object') {
              processedReviews = [ratings];
            }
          }
          setReviews(processedReviews);
        }

        // Check if user has already rated and get order status
        if (token) {
          const [ratedRes, ordersRes, userRatingRes] = await Promise.all([
            fetch(`http://localhost:8080/api/ratings/check?productId=${bookId}`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            fetch('http://localhost:8080/api/orders', {
              headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`http://localhost:8080/api/ratings/user-rating?productId=${bookId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);

          if (ratedRes.ok) {
            const hasRated = await ratedRes.json();
            setHasRated(hasRated);
          }

          if (ordersRes.ok) {
            const orders = await ordersRes.json();
            const orderWithBook = orders.find(order => 
              order.status === 'DELIVERED' && 
              order.items.some(item => item.productId === bookId)
            );
            setOrderStatus(orderWithBook ? 'DELIVERED' : null);
          }

          if (userRatingRes.ok) {
            const rating = await userRatingRes.json();
            setUserRating(rating);
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

    if (!rating) {
      setShowRatingRequired(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate new average rating immediately
      const currentTotal = averageRating * reviews.length;
      const newTotal = currentTotal + rating;
      const newAverage = newTotal / (reviews.length + 1);
      setAverageRating(newAverage);

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
        const newRating = await res.json();
        setHasRated(true);
        setUserRating(newRating);
        setRating(0);
        setComment('');
        onRatingSubmitted?.();
        
        // Update reviews list and average rating with server data
        const [productRes, ratingsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/products/${bookId}`),
          fetch(`http://localhost:8080/api/ratings/product/${bookId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (productRes.ok) {
          const product = await productRes.json();
          setAverageRating(product.rating || 0);
        }

        if (ratingsRes.ok) {
          const text = await ratingsRes.text();
          let processedReviews = [];
          if (text) {
            const ratings = JSON.parse(text);
            if (Array.isArray(ratings)) {
              processedReviews = ratings;
            } else if (ratings && typeof ratings === 'object') {
              processedReviews = [ratings];
            }
          }
          setReviews(processedReviews);
        }
      } else {
        // Revert the average rating if the submission failed
        const currentTotal = averageRating * reviews.length;
        const newTotal = currentTotal - rating;
        const newAverage = reviews.length > 0 ? newTotal / reviews.length : 0;
        setAverageRating(newAverage);
        
        const errText = await res.text();
        alert('Failed to submit rating: ' + errText);
      }
    } catch (err) {
      // Revert the average rating if there was an error
      const currentTotal = averageRating * reviews.length;
      const newTotal = currentTotal - rating;
      const newAverage = reviews.length > 0 ? newTotal / reviews.length : 0;
      setAverageRating(newAverage);
      
      console.error('Failed to submit rating:', err);
      alert('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setHasRated(false);
        setUserRating(null);
        
        // Update reviews list immediately
        const [productRes, ratingsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/products/${bookId}`),
          fetch(`http://localhost:8080/api/ratings/product/${bookId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (productRes.ok) {
          const product = await productRes.json();
          setAverageRating(product.rating || 0);
        }

        if (ratingsRes.ok) {
          const text = await ratingsRes.text();
          let processedReviews = [];
          if (text) {
            const ratings = JSON.parse(text);
            if (Array.isArray(ratings)) {
              processedReviews = ratings;
            } else if (ratings && typeof ratings === 'object') {
              processedReviews = [ratings];
            }
          }
          setReviews(processedReviews);
        }
      } else {
        const errText = await res.text();
        alert('Failed to delete rating: ' + errText);
      }
    } catch (err) {
      console.error('Failed to delete rating:', err);
      alert('Something went wrong');
    }
  };

  const handleEditRating = async (ratingId) => {
    if (!window.confirm('Are you sure you want to edit your review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/ratings/${ratingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment,
        }),
      });

      if (res.ok) {
        const updatedRating = await res.json();
        setUserRating(updatedRating);
        setIsEditing(false);
        
        // Update reviews list immediately
        const [productRes, ratingsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/products/${bookId}`),
          fetch(`http://localhost:8080/api/ratings/product/${bookId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (productRes.ok) {
          const product = await productRes.json();
          setAverageRating(product.rating || 0);
        }

        if (ratingsRes.ok) {
          const text = await ratingsRes.text();
          let processedReviews = [];
          if (text) {
            const ratings = JSON.parse(text);
            if (Array.isArray(ratings)) {
              processedReviews = ratings;
            } else if (ratings && typeof ratings === 'object') {
              processedReviews = [ratings];
            }
          }
          setReviews(processedReviews);
        }
      } else {
        const errText = await res.text();
        alert('Failed to update rating: ' + errText);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to update rating:', err);
      alert('Something went wrong');
      setIsEditing(false);
    }
  };

  const startEditing = (rating) => {
    setEditRating(rating.rating);
    setEditComment(rating.comment || '');
    setIsEditing(true);
  };

  const visibleComments = reviews.filter(
    (r) => r.visible && r.comment && r.comment.trim() !== ''
  );
  
  return (
    <div className="rating-section" id="reviews">
      <div className="rating-header">
        <h3>Ratings & Reviews</h3>
        <div className="average-rating">
          <StarRating rating={averageRating || 0} />
          <span className="rating-count">
            ({reviews.length} ratings, {visibleComments.length} reviews)
          </span>
        </div>
      </div>

      {localStorage.getItem('token') && !hasRated && orderStatus === 'DELIVERED' && (
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

      {localStorage.getItem('token') && orderStatus !== 'DELIVERED' && !hasRated && (
        <div className="notification info">
          You need to purchase and receive this book before you can rate it.
        </div>
      )}

      {localStorage.getItem('token') && userRating && (
        <div style={styles.reviewItem}>
          <div style={styles.reviewHeader}>
            <div style={styles.reviewerInfo}>
              <img 
                src={`https://ui-avatars.com/api/?name=${getInitials('You')}&background=random`} 
                alt="Your avatar" 
                style={styles.reviewerAvatar}
              />
              <div style={styles.reviewerDetails}>
                <span style={styles.reviewerName}>Your Review</span>
                <span style={styles.reviewDate}>{formatDate(userRating.submittedAt || new Date())}</span>
                <div style={styles.reviewerRating}>
                  <StarRating rating={Number(userRating.rating) || 0} readOnly />
                </div>
              </div>
            </div>
            <div>
              <button
                style={styles.editButton}
                onClick={() => startEditing(userRating)}
              >
                Edit
              </button>
              <button
                style={styles.deleteButton}
                onClick={() => handleDeleteRating(userRating.id)}
              >
                Delete
              </button>
            </div>
          </div>
          {isEditing ? (
            <div>
              <div className="star-input">
                <span>Your Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setEditRating(star)}
                    className={`star ${editRating >= star ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Share your thoughts about this book..."
                className="comment-box"
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => handleEditRating(userRating.id)}
                  className="submit-rating-btn"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    background: 'none',
                    border: '1px solid #dc2626',
                    color: '#dc2626',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            userRating.comment && (
              <p style={styles.reviewText}>
                {userRating.comment}
                <span style={{ ...styles.statusBadge, ...(userRating.visible ? styles.visibleStatus : styles.pendingStatus) }}>
                  {userRating.visible ? 'Visible' : 'Pending Approval'}
                </span>
              </p>
            )
          )}
        </div>
      )}

      <div style={styles.container}>
        <div style={styles.reviewsList}>
          {visibleComments.length > 0 ? (
            visibleComments.map((review, index) => (
              <div key={index} style={styles.reviewItem}>
                <div style={styles.reviewHeader}>
                  <div style={styles.reviewerInfo}>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${getInitials(review.user?.name || review.userName || 'Anonymous')}&background=random`} 
                      alt="User avatar" 
                      style={styles.reviewerAvatar}
                    />
                    <div style={styles.reviewerDetails}>
                      <span style={styles.reviewerName}>{maskUsername(review.user?.name || review.userName || 'Anonymous')}</span>
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