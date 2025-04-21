import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import RatingForm from "../../components/RatingForm";
import "./Receipt.css";

const Receipt = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [ratedProducts, setRatedProducts] = useState({});
  const [bookDetails, setBookDetails] = useState({});
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

  // Fetch book details and check which items are rated
  useEffect(() => {
    if (!order || !token) return;

    const checkRatings = async () => {
      const results = {};
      await Promise.all(
        order.items.map(async (item) => {
          if (!item.productId) return;
          try {
            const res = await fetch(
              `http://localhost:8080/api/ratings/check?productId=${item.productId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`, // ✅ JWT
                },
              }
            );
    
            // ✅ Handle 403 errors gracefully
            if (!res.ok) {
              if (res.status === 403) {
                console.warn("Not authorized to check rating (403)");
              } else {
                console.warn("Rating check failed:", res.statusText);
              }
              results[item.productId] = false;
              return;
            }
    
            const hasRated = await res.json();
            results[item.productId] = hasRated;
          } catch (err) {
            console.error("Failed to check rating", err);
            results[item.productId] = false;
          }
        })
      );
      setRatedProducts(results);
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
  }, [order, token]); // ✅ proper dependencies

  if (!order) {
    return <div className="receipt-container">Loading order...</div>;
  }

  return (
    <div className="receipt-container">
      <div className="receipt-box">
        <h1>Thank You For Your Order!</h1>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Shipping Method:</strong> {order.shippingMethod}</p>
        <p><strong>Status:</strong> {order.status}</p>

        <h2>Items:</h2>
        <ul className="receipt-item-list">
          {order.items.map((item) => {
            const book = bookDetails[item.productId];
            const isRated = ratedProducts[item.productId];

            return (
              <li key={item.productId} className="receipt-item">
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
                          <p className="already-rated">
                            ✅ You've already rated this product.
                          </p>
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
