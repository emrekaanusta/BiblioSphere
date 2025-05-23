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
  const [savedName,    setSavedName]    = useState("");
  const [savedSurname, setSavedSurname] = useState("");

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
        setSavedName(res.data.name || "");
        setSavedSurname(res.data.surname || "");
        setFormData(prev => ({
          ...prev,
          firstName: res.data.name || "",
          lastName: res.data.surname || ""
        }));
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
      // Remove non-digits and limit to 16 digits
      v = v.replace(/\D/g, "").slice(0, 16);
      // Add space after every 4 digits
      v = v.replace(/(\d{4})/g, "$1 ").trim();
    }
    else if (name === "expiryDate") {
      // Remove non-digits and limit to 4 digits
      v = v.replace(/\D/g, "").slice(0, 4);
      // Add slash after first 2 digits
      if (v.length >= 2) {
        v = v.slice(0,2) + "/" + v.slice(2);
      }
    }
    else if (name === "cvv") {
      // Remove non-digits and limit to 3 digits
      v = v.replace(/\D/g, "").slice(0, 3);
    }
    
    setFormData(fd => ({ ...fd, [name]: v }));
    if (errors[name]) setErrors(err => ({ ...err, [name]: "" }));
  };

  const validateCardNumber = n => {
    const digits = n.replace(/\D/g, "");
    if (digits.length !== 16) {
      return "Card number must be 16 digits";
    }
    return "";
  };

  const validateCVV = c => {
    if (c.length !== 3) {
      return "CVV must be 3 digits";
    }
    return "";
  };

  const validateExpiry = d => {
    if (!/^\d{2}\/\d{2}$/.test(d)) {
      return "Enter expiry as MM/YY";
    }
    const [month, year] = d.split("/");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      return "Invalid month";
    }
    if (parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      return "Card has expired";
    }
    return "";
  };

  const validateForm = () => {
    const e = {};
    const cardError = validateCardNumber(formData.cardNumber);
    const cvvError = validateCVV(formData.cvv);
    const expiryError = validateExpiry(formData.expiryDate);
    
    if (cardError) e.cardNumber = cardError;
    if (cvvError) e.cvv = cvvError;
    if (expiryError) e.expiryDate = expiryError;
    
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

    const shippingInfo = {
      firstName: formData.firstName,
      lastName:  formData.lastName,
      email:     formData.email,
      address:   formData.address || savedAddress,
      city:      formData.city    || savedCity,
      zipCode:   formData.zipCode || savedZip
    };

    const payload = {
      items: cart.map(it => ({
        productId: it.isbn,
        title: it.title,
        quantity:  it.quantity,
        price:     it.discountPercentage > 0 ? it.discountedPrice : it.price,
        image:     it.image
      })),
      shippingMethod,
      shippingInfo,
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
      // First create the order
      const res = await axios.post("http://localhost:8080/api/orders", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Then update user profile with shipping info
      await axios.put("http://localhost:8080/api/users/me", {
        name: shippingInfo.firstName,
        surname: shippingInfo.lastName,
        address: shippingInfo.address,
        city: shippingInfo.city,
        ZipCode: shippingInfo.zipCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      clearCart();
      navigate(`/receipt/${res.data.id}`);
    } catch (error) {
      console.error("Error during order process:", error);
      showWarning(error.response?.data || "Something went wrong. Please try again.");
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
            <div className="email-input-group">
              <input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName || savedName}
                onChange={handleInputChange}
                required
                className="autofilled"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>
            <div className="email-input-group">
              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName || savedSurname}
                onChange={handleInputChange}
                required
                className="autofilled"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>
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
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
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
          <div className="payment-input-group">
            <input
              name="cardNumber"
              placeholder="Card Number (16 digits)"
              value={formData.cardNumber}
              onChange={handleInputChange}
              required
              maxLength={19}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
            {errors.cardNumber && <div className="error-message">{errors.cardNumber}</div>}
          </div>
          <div className="form-row">
            <div className="payment-input-group">
              <input
                name="expiryDate"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleInputChange}
                required
                maxLength={5}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
              {errors.expiryDate && <div className="error-message">{errors.expiryDate}</div>}
            </div>
            <div className="payment-input-group">
              <input
                name="cvv"
                placeholder="CVV"
                value={formData.cvv}
                onChange={handleInputChange}
                required
                maxLength={3}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
              {errors.cvv && <div className="error-message">{errors.cvv}</div>}
            </div>
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
