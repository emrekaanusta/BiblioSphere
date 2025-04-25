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
    updateShippingMethod,
    clearCart,
    showWarning,
    warning
  } = useCart();

  const navigate = useNavigate();

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

  const validateCardNumber = (n) => n.replace(/\D/g, "").length === 16;
  const validateCVV = (c) => /^\d{3}$/.test(c);
  const validateZip = (z) => /^\d{5}(-\d{4})?$/.test(z);
  const validateExpiry = (d) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(d);

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

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity > item.stock) {
      showWarning(`Cannot add more items. Only ${item.stock} available in stock.`);
      return;
    }
    updateQuantity(item.isbn, newQuantity);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (cart.some(item => item.stock === 0)) {
      showWarning("Cannot proceed with out-of-stock items in cart");
      return;
    }

    try {
      setIsProcessing(true);

      const subtotal = getSubtotal();
      const shippingCost = getShippingCost();
      const total = getCartTotal();

      const orderPayload = {
        items: cart.map((item) => ({
          productId: item.isbn,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        shippingMethod,
        shippingInfo: formData,
        subtotal,
        shippingCost,
        total,
      };

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const order = await response.json();

      clearCart();

      navigate(`/receipt/${order.id}`);
    } catch (err) {
      console.error(err);
      showWarning("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = subtotal + shippingCost;
  const isFreeShipping = shippingCost === 0;

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
          <div className="cart-items">
            {cart.map((it) => (
              <div key={it.isbn} className="checkout-item">
                <img src={it.image} alt={it.title} className="checkout-item-image" />
                <div className="checkout-item-details">
                  <h3>{it.title}</h3>
                  <p>Price: ${it.price}</p>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => handleQuantityChange(it, it.quantity - 1)}
                      disabled={it.quantity <= 1}
                    >
                      -
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

        <form onSubmit={handleSubmit} className="checkout-form">
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

          <div className="shipping-options">
            <h2>Shipping Method</h2>
            {isFreeShipping ? (
              <div className="free-shipping-message">Congratulations! You've qualified for FREE shipping!</div>
            ) : (
              <>
                <div className="shipping-option">
                  <input type="radio" id="standard" name="shipping" value="standard" checked={shippingMethod === "standard"} onChange={(e) => updateShippingMethod(e.target.value)} />
                  <label htmlFor="standard">Standard Shipping ($5.00) - 5-7 business days</label>
                </div>
                <div className="shipping-option">
                  <input type="radio" id="express" name="shipping" value="express" checked={shippingMethod === "express"} onChange={(e) => updateShippingMethod(e.target.value)} />
                  <label htmlFor="express">Express Shipping ($15.00) - 1-2 business days</label>
                </div>
              </>
            )}
          </div>

          <button 
            type="submit" 
            className="place-order-btn"
            disabled={cart.some(item => item.stock === 0)}
          >
            Place Order
          </button>
        </form>
      </div>
      {warning && (
        <div className="warning-popup">
          {warning}
        </div>
      )}
    </div>
  );
};

export default Checkout;
