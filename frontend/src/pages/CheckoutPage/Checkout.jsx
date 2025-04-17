import React, { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
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
    setShippingMethod,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  /* --------------------------- local state --------------------------- */
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});

  /* ---------------------------- validators --------------------------- */
  const validateCardNumber = (n) => n.replace(/\D/g, "").length === 16;
  const validateCVV = (c) => /^\d{3}$/.test(c);
  const validateZip = (z) => /^\d{5}(-\d{4})?$/.test(z);
  const validateExpiry = (d) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(d);

  /* --------------------------- handlers ------------------------------ */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "cardNumber") v = value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim();
    if (name === "expiryDate") {
      v = value.replace(/\D/g, "");
      if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
    }
    setFormData((p) => ({ ...p, [name]: v }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateForm = () => {
    const e = {};
    if (!validateCardNumber(formData.cardNumber)) e.cardNumber = "Please enter a valid 16‑digit card number";
    if (!validateCVV(formData.cvv)) e.cvv = "Please enter a valid 3‑digit CVV";
    if (!validateZip(formData.zipCode)) e.zipCode = "Please enter a valid ZIP code";
    if (!validateExpiry(formData.expiryDate)) e.expiryDate = "Please enter a valid expiry date (MM/YY)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsProcessing(true);

      const subtotal = getSubtotal();
      const shippingCost = getShippingCost();
      const total = getCartTotal();

      const orderPayload = {
        items: cart,
        shippingMethod,
        shippingInfo: formData,
        subtotal,
        shippingCost,
        total,
      };

      const token = localStorage.getItem("token");
      await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      clearCart();

      setTimeout(() => navigate("/orders"), 3000);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  /* --------------------------- derived totals ------------------------ */
  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getCartTotal();
  const isFreeShipping = shippingCost === 0;

  /* ------------------------------ UI --------------------------------- */
  return (
    <div className="checkout-container">
      {isProcessing && (
        <div className="processing-overlay">
          <h1>Processing your order…</h1>
        </div>
      )}

      <div className="checkout-content">
        {/* order summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="cart-items">
            {cart.map((it) => (
              <div key={it.id} className="checkout-item">
                <img src={it.image} alt={it.title} className="checkout-item-image" />
                <div className="checkout-item-details">
                  <h3>{it.title}</h3>
                  <p>Price: ${it.price}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(it.id, Math.max(1, it.quantity - 1))}>-</button>
                    <span>{it.quantity}</span>
                    <button onClick={() => updateQuantity(it.id, it.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(it.id)} className="remove-btn">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="price-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{isFreeShipping ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            {!isFreeShipping && (
              <div className="free-shipping-notice">
                Add ${(100 - subtotal).toFixed(2)} more to get FREE shipping!
              </div>
            )}
            <div className="summary-row total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* checkout form */}
        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Shipping Information */}
          <div className="form-section">
            <h2>Shipping Information</h2>
            <div className="form-row">
              <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required />
              <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required />
            </div>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
            <input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
            <div className="form-row">
              <input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required />
              <div className="input-group">
                <input name="zipCode" placeholder="ZIP Code" value={formData.zipCode} onChange={handleInputChange} required />
                {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="form-section">
            <h2>Payment Information</h2>
            <div className="input-group">
              <input name="cardNumber" placeholder="Card Number" value={formData.cardNumber} onChange={handleInputChange} maxLength={19} required />
              {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
            </div>
            <div className="form-row">
              <div className="input-group">
                <input name="expiryDate" placeholder="MM/YY" value={formData.expiryDate} onChange={handleInputChange} maxLength={5} required />
                {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
              </div>
              <div className="input-group">
                <input name="cvv" placeholder="CVV" value={formData.cvv} onChange={handleInputChange} maxLength={3} required />
                {errors.cvv && <span className="error-message">{errors.cvv}</span>}
              </div>
            </div>
          </div>

          {/* Shipping Options */}
          <div className="shipping-options">
            <h2>Shipping Method</h2>
            {isFreeShipping ? (
              <div className="free-shipping-message">Congratulations! You've qualified for FREE shipping!</div>
            ) : (
              <>
                <div className="shipping-option">
                  <input type="radio" id="standard" name="shipping" value="standard" checked={shippingMethod === "standard"} onChange={(e) => setShippingMethod(e.target.value)} />
                  <label htmlFor="standard">Standard Shipping ($5.00) - 5-7 business days</label>
                </div>
                <div className="shipping-option">
                  <input type="radio" id="express" name="shipping" value="express" checked={shippingMethod === "express"} onChange={(e) => setShippingMethod(e.target.value)} />
                  <label htmlFor="express">Express Shipping ($15.00) - 1-2 business days</label>
                </div>
              </>
            )}
          </div>

          <button type="submit" className="place-order-btn">Place Order</button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
