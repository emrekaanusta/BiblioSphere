import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import RatingForm from "../../components/RatingForm";
import StarRating from "../../components/StarRating";
import "./Receipt.css";
import emailjs from '@emailjs/browser';

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
  editButton: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    padding: '4px 8px',
    fontSize: '0.9em',
  },
};

const generateItemsHtml = (items) => {
  return `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr><th>Image</th><th>Title</th><th>Quantity</th><th>Price</th></tr>
      </thead>
      <tbody>
        ${items.map(it => `
          <tr>
            <td><img src="${it.image}" width="60" style="border-radius: 4px;" /></td>
            <td>${it.title}</td>
            <td>${it.quantity}</td>
            <td>$${(it.price * it.quantity).toFixed(2)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
};

const Receipt = () => {
  const { orderId } = useParams();
  const [emailSent, setEmailSent] = useState(false);
  const [order, setOrder] = useState(null);
  const [ratedProducts, setRatedProducts] = useState({});
  const [bookDetails, setBookDetails] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [editingRating, setEditingRating] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
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

  useEffect(() => {
    if (!order || emailSent) return;

    const templateParams = {
      to_email: order.shippingInfo.email,
      order_date: new Date(order.createdAt).toLocaleDateString(),
      items_html: generateItemsHtml(order.items), // 🔥 bu satırı ekle

      subtotal: order.subtotal.toFixed(2),
      shipping: order.shippingCost.toFixed(2),
      total: order.total.toFixed(2),
      name: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
      address_line: order.shippingInfo.address,
      city_zip: `${order.shippingInfo.city}, ${order.shippingInfo.zipCode}`,
      email: order.shippingInfo.email,
    };
    console.log("🚀 Sending confirmation email to:", order.shippingInfo.email);
    emailjs.send(
        'service_sp2mkzq',
        'template_g066g9s',
        templateParams,
        'YHWWSBWcWWeVfPUUd'
    ).then(() => {
      setEmailSent(true);
      console.log('Confirmation email sent');
    }).catch((err) => {
      console.error('Email send failed:', err);
    });

  }, [order, emailSent]);

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

  const startEditing = (rating) => {
    setEditingRating(rating);
    setEditRating(rating.rating);
    setEditComment(rating.comment || '');
  };

  const handleEditRating = async (ratingId) => {
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
          rating: editRating,
          comment: editComment,
        }),
      });

      if (res.ok) {
        const updatedRating = await res.json();
        setUserRatings(prev => ({
          ...prev,
          [updatedRating.productId]: updatedRating
        }));
        setEditingRating(null);
      } else {
        const errText = await res.text();
        alert('Failed to update rating: ' + errText);
      }
    } catch (err) {
      console.error('Failed to update rating:', err);
      alert('Something went wrong');
    }
  };

  const cancelEditing = () => {
    setEditingRating(null);
    setEditRating(0);
    setEditComment('');
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
                                            {editingRating?.id === userRating?.id ? (
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
                                                    onClick={cancelEditing}
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
                                            ) : userRating?.comment && (
                                              <p style={styles.reviewText}>
                                                {userRating.comment}
                                                <span style={{ ...styles.statusBadge, ...(userRating.visible ? styles.visibleStatus : styles.pendingStatus) }}>
                                                  {userRating.visible ? 'Visible' : 'Pending Approval'}
                                                </span>
                                              </p>
                                            )}
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
                                            onClick={() => handleDeleteRating(userRating?.id, item.productId)}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
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
