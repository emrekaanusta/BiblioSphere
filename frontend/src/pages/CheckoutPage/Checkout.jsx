// src/pages/Checkout/Checkout.jsx

import React, { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";

const Checkout = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getSubtotal,
    getShippingCost,
    getCartTotal,
    shippingMethod,
    updateShippingMethod,
    clearCart,
    showWarning,
    warning
  } = useCart();

  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [formData, setFormData] = useState({
    firstName:  "",
    lastName:   "",
    email:      localStorage.getItem("userEmail") || "",
    address:    "",
    city:       "",
    zipCode:    "",
    cardNumber: "",
    expiryDate: "",
    cvv:        ""
  });
  const [errors, setErrors] = useState({});

  // Prefill saved address/profile info
  const [savedAddress, setSavedAddress] = useState("");
  const [savedCity,    setSavedCity]    = useState("");
  const [savedZip,     setSavedZip]     = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("http://localhost:8080/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setSavedAddress(res.data.address || "");
        setSavedCity(res.data.city || "");
        setSavedZip(res.data.zipCode || "");
      })
      .catch(() => {});
  }, []);

  const handleEmailEdit = () => setIsEditingEmail(true);
  const handleEmailSave = () => {
    setIsEditingEmail(false);
    localStorage.setItem("userEmail", formData.email);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    let v = value;
    if (name === "cardNumber") {
      v = v.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim();
    }
    if (name === "expiryDate") {
      v = v.replace(/\D/g, "");
      if (v.length >= 2) v = v.slice(0,2) + "/" + v.slice(2);
    }
    setFormData(fd => ({ ...fd, [name]: v }));
    if (errors[name]) setErrors(err => ({ ...err, [name]: "" }));
  };

  const validateCardNumber = n => n.replace(/\D/g, "").length === 16;
  const validateCVV        = c => /^\d{3}$/.test(c);
  const validateZip        = z => /^\d{5}(-\d{4})?$/.test(z);
  const validateExpiry     = d => /^(0[1-9]|1[0-2])\/\d{2}$/.test(d);

  const validateForm = () => {
    const e = {};
    if (!validateCardNumber(formData.cardNumber))
      e.cardNumber = "Enter a valid 16-digit card number";
    if (!validateCVV(formData.cvv))
      e.cvv = "Enter a valid 3-digit CVV";
    if (!validateZip(formData.zipCode))
      e.zipCode = "Enter a valid ZIP code";
    if (!validateExpiry(formData.expiryDate))
      e.expiryDate = "Enter expiry as MM/YY";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleQuantityChange = (item, qty) => {
    if (qty > item.stock) {
      showWarning(`Only ${item.stock} in stock`);
      return;
    }
    updateQuantity(item.isbn, qty);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cart.some(i => i.stock === 0)) {
      showWarning("Remove out-of-stock items first");
      return;
    }

    setIsProcessing(true);
    const subtotal     = getSubtotal();
    const shippingCost = getShippingCost();
    const total        = getCartTotal();

    const payload = {
      items: cart.map(it => ({
        productId: it.isbn,
        quantity:  it.quantity,
        price:     it.discountPercentage > 0 ? it.discountedPrice : it.price,
        image:     it.image
      })),
      shippingMethod,
      shippingInfo: {
        firstName: formData.firstName,
        lastName:  formData.lastName,
        email:     formData.email,
        address:   formData.address || savedAddress,
        city:      formData.city    || savedCity,
        zipCode:   formData.zipCode || savedZip
      },
      paymentInfo: {
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiryDate,
        cvv:        formData.cvv
      },
      subtotal,
      shippingCost,
      total
    };

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:8080/api/orders", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      clearCart();
      navigate(`/receipt/${res.data.id}`);
    } catch {
      showWarning("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const subtotal     = getSubtotal();
  const shippingCost = getShippingCost();
  const total        = subtotal + shippingCost;
  const isFree       = shippingCost === 0;

  return (
    <div className="checkout-container">
      {isProcessing && (
        <div className="processing-overlay">
          <h1>Processing your order…</h1>
        </div>
      )}
      <div className="checkout-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          {cart.map(it => (
            <div key={it.isbn} className="checkout-item">
              <img src={it.image} alt={it.title} className="checkout-item-image" />
              <div className="checkout-item-details">
                <h3>{it.title}</h3>
                <p>
                  Price: $
                  {(it.discountPercentage > 0
                    ? (it.discountedPrice || it.price).toFixed(2)
                    : it.price.toFixed(2)
                  )}{" "}
                  {it.discountPercentage > 0 && (
                    <span style={{ color: "green", marginLeft: 8 }}>
                      ({it.discountPercentage}% off)
                    </span>
                  )}
                </p>
                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(it, it.quantity - 1)}
                    disabled={it.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{it.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(it, it.quantity + 1)}
                    disabled={it.quantity >= it.stock}
                  >
                    +
                  </button>
                </div>
                <p>Stock: {it.stock}</p>
                <button
                  onClick={() => removeFromCart(it.isbn)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="price-summary">
            <div>
              <strong>Subtotal:</strong> ${subtotal.toFixed(2)}
            </div>
            <div>
              <strong>Shipping:</strong>{" "}
              {isFree ? "FREE" : `$${shippingCost.toFixed(2)}`}
            </div>
            {!isFree && (
              <div className="free-shipping-notice">
                Add ${(100 - subtotal).toFixed(2)} more for FREE shipping!
              </div>
            )}
            <div>
              <strong>Total:</strong> ${total.toFixed(2)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <h2>Shipping Information</h2>

          <div className="form-row">
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="email-input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={!isEditingEmail}
              required
            />
            {!isEditingEmail ? (
              <button type="button" onClick={handleEmailEdit}>
                Edit
              </button>
            ) : (
              <button type="button" onClick={handleEmailSave}>
                Save
              </button>
            )}
          </div>

          {/* Prefilled Address, City, ZIP as editable textboxes */}
          <input
            name="address"
            placeholder="Address"
            value={formData.address || savedAddress}
            onChange={handleInputChange}
            required
          />
          <div className="form-row">
            <input
              name="city"
              placeholder="City"
              value={formData.city || savedCity}
              onChange={handleInputChange}
              required
            />
            <input
              name="zipCode"
              placeholder="ZIP Code"
              value={formData.zipCode || savedZip}
              onChange={handleInputChange}
              required
            />
          </div>

          <h2>Payment Information</h2>
          <input
            name="cardNumber"
            placeholder="Card Number"
            value={formData.cardNumber}
            onChange={handleInputChange}
            required
          />
          <div className="form-row">
            <input
              name="expiryDate"
              placeholder="MM/YY"
              value={formData.expiryDate}
              onChange={handleInputChange}
              required
            />
            <input
              name="cvv"
              placeholder="CVV"
              value={formData.cvv}
              onChange={handleInputChange}
              required
            />
          </div>

          <h2>Shipping Method</h2>
          <label>
            <input
              type="radio"
              name="shipping"
              value="standard"
              checked={shippingMethod === "standard"}
              onChange={e => updateShippingMethod(e.target.value)}
            />{" "}
            Standard ($5)
          </label>
          <label>
            <input
              type="radio"
              name="shipping"
              value="express"
              checked={shippingMethod === "express"}
              onChange={e => updateShippingMethod(e.target.value)}
            />{" "}
            Express ($15)
          </label>

          <button
            type="submit"
            className="place-order-btn"
            disabled={cart.some(i => i.stock === 0)}
          >
            Place Order
          </button>
        </form>

        {warning && <div className="warning-popup">{warning}</div>}
      </div>
    </div>
  );
};

export default Checkout;
