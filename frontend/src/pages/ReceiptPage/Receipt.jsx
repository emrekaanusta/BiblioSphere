import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import RatingForm from "../../components/RatingForm";
import StarRating from "../../components/StarRating";
import "./Receipt.css";

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

const Receipt = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [ratedProducts, setRatedProducts] = useState({});
  const [bookDetails, setBookDetails] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [editingRatings, setEditingRatings] = useState({});
  const [editComments, setEditComments] = useState({});
  const [editRatings, setEditRatings] = useState({});
  const token = localStorage.getItem("token");

  // Fetch the order
  useEffect(() => {
    if (!orderId || !token) return;

    fetch(`http://localhost:8080/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch((err) => console.error("Failed to fetch order:", err));
  }, [orderId, token]);

  // Fetch book details, check ratings, and get user ratings
  useEffect(() => {
    if (!order || !token) return;

    const checkRatings = async () => {
      const results = {};
      const userRatingsMap = {};
      await Promise.all(
        order.items.map(async (item) => {
          if (!item.productId) return;
          try {
            const [ratedRes, userRatingRes] = await Promise.all([
              fetch(
                `http://localhost:8080/api/ratings/check?productId=${item.productId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              ),
              fetch(
                `http://localhost:8080/api/ratings/user-rating?productId=${item.productId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
            ]);

            if (ratedRes.ok) {
              const hasRated = await ratedRes.json();
              results[item.productId] = hasRated;
            }

            if (userRatingRes.ok) {
              const rating = await userRatingRes.json();
              if (rating) {
                userRatingsMap[item.productId] = rating;
              }
            }
          } catch (err) {
            console.error("Failed to check rating", err);
            results[item.productId] = false;
          }
        })
      );
      setRatedProducts(results);
      setUserRatings(userRatingsMap);
    };

    const fetchBookDetails = async () => {
      const ids = order.items.map((i) => i.productId);
      try {
        const responses = await Promise.all(
          ids.map(async (id) => {
            if (!id) return null;
            try {
              const res = await fetch(`http://localhost:8080/api/products/${id}`);
              if (!res.ok) throw new Error(`Failed to fetch product ${id}`);
              return await res.json();
            } catch (err) {
              console.error("Product fetch failed:", id, err);
              return null;
            }
          })
        );

        const detailsMap = {};
        responses.forEach((book) => {
          if (book?.isbn) {
            detailsMap[book.isbn] = book;
          }
        });

        setBookDetails(detailsMap);
      } catch (err) {
        console.error("Failed to fetch all product details:", err);
      }
    };

    checkRatings();
    fetchBookDetails();
  }, [order, token]);

  const handleDeleteRating = async (ratingId, productId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setRatedProducts(prev => ({ ...prev, [productId]: false }));
        setUserRatings(prev => {
          const newRatings = { ...prev };
          delete newRatings[productId];
          return newRatings;
        });
      } else {
        const errText = await res.text();
        alert('Failed to delete rating: ' + errText);
      }
    } catch (err) {
      console.error('Failed to delete rating:', err);
      alert('Something went wrong');
    }
  };

  const handleEditRating = async (ratingId, productId) => {
    if (!window.confirm('Are you sure you want to edit your review?')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/ratings/${ratingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: editRatings[productId],
          comment: editComments[productId],
        }),
      });

      if (res.ok) {
        const updatedRating = await res.json();
        setUserRatings(prev => ({ ...prev, [productId]: updatedRating }));
        setEditingRatings(prev => ({ ...prev, [productId]: false }));
        // Refresh reviews
        const productRes = await fetch(`http://localhost:8080/api/products/${productId}`);
        if (productRes.ok) {
          const product = await productRes.json();
          setBookDetails(prev => ({ ...prev, [product.isbn]: product }));
        }
      } else {
        const errText = await res.text();
        alert('Failed to update rating: ' + errText);
      }
    } catch (err) {
      console.error('Failed to update rating:', err);
      alert('Something went wrong');
    }
  };

  const startEditing = (rating, productId) => {
    setEditRatings(prev => ({ ...prev, [productId]: rating.rating }));
    setEditComments(prev => ({ ...prev, [productId]: rating.comment || '' }));
    setEditingRatings(prev => ({ ...prev, [productId]: true }));
  };

  if (!order) {
    return <div className="receipt-container">Loading order...</div>;
  }

  return (
    <div className="receipt-container">
      <div className="receipt-content">
        <h2>Order Receipt</h2>
        <p className="order-date">Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
        <p className="order-status">Status: {order.status}</p>

        <ul className="receipt-items">
          {order.items.map((item, index) => {
            const isRated = ratedProducts[item.productId];
            const userRating = userRatings[item.productId];
            const book = bookDetails[item.productId];

            return (
              <li key={index} className="receipt-item">
                <div className="receipt-book-row">
                  <Link to={`/books/${item.productId}`}>
                    <img
                      src={item.image || book?.image || "https://via.placeholder.com/100x150?text=No+Image"}
                      alt={item.title}
                      className="receipt-book-image"
                    />
                  </Link>
                  <div className="receipt-book-details">
                    <div className="receipt-book-title">
                      <strong>{item.title}</strong> × {item.quantity}
                    </div>
                    <div className="receipt-book-price">
                      ${Number(item.price * item.quantity).toFixed(2)}
                    </div>

                    {order.status === "DELIVERED" && (
                      <div className="rating-section">
                        {isRated ? (
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
                                  <span style={styles.reviewDate}>{formatDate(userRating?.submittedAt || new Date())}</span>
                                  <div style={styles.reviewerRating}>
                                    <StarRating rating={Number(userRating?.rating) || 0} readOnly />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <button
                                  style={styles.editButton}
                                  onClick={() => startEditing(userRating, item.productId)}
                                >
                                  Edit
                                </button>
                                <button
                                  style={styles.deleteButton}
                                  onClick={() => handleDeleteRating(userRating?.id, item.productId)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            {editingRatings[item.productId] ? (
                              <div>
                                <div className="star-input">
                                  <span>Your Rating:</span>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      onClick={() => setEditRatings(prev => ({ ...prev, [item.productId]: star }))}
                                      className={`star ${editRatings[item.productId] >= star ? 'filled' : ''}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <textarea
                                  value={editComments[item.productId] || ''}
                                  onChange={(e) => setEditComments(prev => ({ ...prev, [item.productId]: e.target.value }))}
                                  placeholder="Share your thoughts about this book..."
                                  className="comment-box"
                                />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                  <button
                                    onClick={() => handleEditRating(userRating?.id, item.productId)}
                                    className="submit-rating-btn"
                                  >
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={() => setEditingRatings(prev => ({ ...prev, [item.productId]: false }))}
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
                              userRating?.comment && (
                                <p style={styles.reviewText}>
                                  {userRating.comment}
                                  <span style={{ ...styles.statusBadge, ...(userRating.visible ? styles.visibleStatus : styles.pendingStatus) }}>
                                    {userRating.visible ? 'Visible' : 'Pending Approval'}
                                  </span>
                                </p>
                              )
                            )}
                          </div>
                        ) : (
                          <RatingForm
                            productId={item.productId}
                            orderId={order.id}
                            onRated={() =>
                              setRatedProducts((prev) => ({
                                ...prev,
                                [item.productId]: true,
                              }))
                            }
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="receipt-summary">
          <p>Subtotal: ${order.subtotal.toFixed(2)}</p>
          <p>Shipping: ${order.shippingCost.toFixed(2)}</p>
          <p><strong>Total: ${order.total.toFixed(2)}</strong></p>
        </div>

        <div className="shipping-info">
          <h3>Shipping Information:</h3>
          <p>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
          <p>{order.shippingInfo.address}</p>
          <p>{order.shippingInfo.city}, {order.shippingInfo.zipCode}</p>
          <p>Email: {order.shippingInfo.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
