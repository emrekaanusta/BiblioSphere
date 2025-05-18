import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import RatingForm from "../../components/RatingForm";
import StarRating from "../../components/StarRating";
import emailjs from '@emailjs/browser';
import "./Receipt.css";

const Receipt = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [ratedProducts, setRatedProducts] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [editingRatings, setEditingRatings] = useState({});
  const [editComments, setEditComments] = useState({});
  const [editRatings, setEditRatings] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!orderId || !token) return;
    fetch(`http://localhost:8080/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrder(data))
      .catch(err => console.error("Failed to fetch order:", err));
  }, [orderId, token]);

  useEffect(() => {
    if (!order || emailSent) return;

    const templateParams = {
      to_email: order.shippingInfo.email,
      order_date: new Date(order.createdAt).toLocaleDateString(),
      items_html: generateItemsHtml(order.items),
      subtotal: order.subtotal.toFixed(2),
      shipping: order.shippingCost.toFixed(2),
      total: order.total.toFixed(2),
      name: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
      address_line: order.shippingInfo.address,
      city_zip: `${order.shippingInfo.city}, ${order.shippingInfo.zipCode}`,
      email: order.shippingInfo.email,
    };

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

  useEffect(() => {
    if (!order || !token) return;

    const fetchRatings = async () => {
      const results = {};
      const ratings = {};

      await Promise.all(order.items.map(async (item) => {
        if (!item.productId) return;

        try {
          const [ratedRes, userRatingRes] = await Promise.all([
            fetch(`http://localhost:8080/api/ratings/check?productId=${item.productId}`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`http://localhost:8080/api/ratings/user-rating?productId=${item.productId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);

          if (ratedRes.ok) results[item.productId] = await ratedRes.json();
          if (userRatingRes.ok) {
            const rating = await userRatingRes.json();
            if (rating) ratings[item.productId] = rating;
          }
        } catch (error) {
          console.error(error);
          results[item.productId] = false;
        }
      }));

      setRatedProducts(results);
      setUserRatings(ratings);
    };

    fetchRatings();
  }, [order, token]);

  const generateItemsHtml = (items) => {
    return `
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr><th>Image</th><th>Title</th><th>Quantity</th><th>Price</th></tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td><img src="${item.image || ''}" width="60" /></td>
              <td>${item.title}</td>
              <td>${item.quantity}</td>
              <td>$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  const handleDeleteRating = async (ratingId, productId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    try {
      const res = await fetch(`http://localhost:8080/api/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setRatedProducts(prev => ({ ...prev, [productId]: false }));
        setUserRatings(prev => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });
      } else {
        const errText = await res.text();
        alert('Failed to delete rating: ' + errText);
      }
    } catch (err) {
      alert('Something went wrong');
    }
  };

  const handleEditRating = async (ratingId, productId) => {
    if (!window.confirm('Save changes to your review?')) return;

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
        const updated = await res.json();
        setUserRatings(prev => ({ ...prev, [productId]: updated }));
        setEditingRatings(prev => ({ ...prev, [productId]: false }));
      } else {
        const errText = await res.text();
        alert('Failed to update rating: ' + errText);
      }
    } catch (err) {
      alert('Something went wrong');
    }
  };

  const startEditing = (rating, productId) => {
    setEditRatings(prev => ({ ...prev, [productId]: rating.rating }));
    setEditComments(prev => ({ ...prev, [productId]: rating.comment || '' }));
    setEditingRatings(prev => ({ ...prev, [productId]: true }));
  };

  if (!order) return <div className="receipt-container">Loading order...</div>;

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

            return (
              <li key={index} className="receipt-item">
                <div className="receipt-book-row">
                  <Link to={`/books/${item.productId}`}>
                    <img
                      src={item.image || "https://via.placeholder.com/100x150?text=No+Image"}
                      alt={item.title}
                      className="receipt-book-image"
                    />
                  </Link>
                  <div className="receipt-book-details">
                    <div className="receipt-book-title">
                      <strong>{item.title}</strong> × {item.quantity}
                    </div>
                    <div className="receipt-book-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>

                    {order.status === "DELIVERED" && (
                      <div className="rating-section">
                        {isRated ? (
                          <div>
                            <strong>Your Rating:</strong>
                            <StarRating rating={userRating?.rating || 0} readOnly />
                            <div style={{ marginTop: '8px' }}>
                              <button onClick={() => startEditing(userRating, item.productId)}>Edit</button>
                              <button onClick={() => handleDeleteRating(userRating?.id, item.productId)}>Delete</button>
                            </div>

                            {editingRatings[item.productId] && (
                              <div style={{ marginTop: '8px' }}>
                                <div>
                                  <span>Edit Stars:</span>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      onClick={() => setEditRatings(prev => ({ ...prev, [item.productId]: star }))}
                                      className={`star ${editRatings[item.productId] >= star ? 'filled' : ''}`}
                                      style={{ cursor: 'pointer', fontSize: '20px', marginRight: '4px' }}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <textarea
                                  value={editComments[item.productId] || ''}
                                  onChange={(e) => setEditComments(prev => ({ ...prev, [item.productId]: e.target.value }))}
                                  placeholder="Edit your comment"
                                  className="comment-box"
                                />
                                <div style={{ marginTop: '8px' }}>
                                  <button onClick={() => handleEditRating(userRating?.id, item.productId)}>Save</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <RatingForm
                            productId={item.productId}
                            orderId={order.id}
                            onRated={() => setRatedProducts(prev => ({ ...prev, [item.productId]: true }))}
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
          <h3>Shipping Information</h3>
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
