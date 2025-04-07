import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, shippingMethod, setShippingMethod } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});

  const validateCardNumber = (number) => {
    // Remove spaces and non-numeric characters
    const cleanNumber = number.replace(/\s/g, '').replace(/\D/g, '');
    return cleanNumber.length === 16;
  };

  const validateCVV = (cvv) => {
    return /^\d{3}$/.test(cvv);
  };

  const validateZipCode = (zip) => {
    return /^\d{5}(-\d{4})?$/.test(zip);
  };

  const validateExpiryDate = (date) => {
    return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(date);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!validateCVV(formData.cvv)) {
      newErrors.cvv = 'Please enter a valid 3-digit CVV';
    }

    if (!validateZipCode(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid 5-digit ZIP code';
    }

    if (!validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically process the payment and create the order
      alert('Order placed successfully!');
      navigate('/');
    }
  };

  const subtotal = getCartTotal();
  const isFreeShipping = subtotal >= 100;
  const shippingCost = isFreeShipping ? 0 : (shippingMethod === 'express' ? 15 : shippingMethod === 'standard' ? 5 : 0);
  const total = subtotal + shippingCost;

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="checkout-item">
                <img src={item.image} alt={item.title} className="checkout-item-image" />
                <div className="checkout-item-details">
                  <h3>{item.title}</h3>
                  <p>Price: ${item.price}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="remove-btn">Remove</button>
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
              <span>{isFreeShipping ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
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
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            <div className="form-row">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <div className="input-group">
                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP Code"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
                {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Payment Information</h2>
            <div className="input-group">
              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number"
                value={formData.cardNumber}
                onChange={handleInputChange}
                maxLength="19"
                required
              />
              {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
            </div>
            <div className="form-row">
              <div className="input-group">
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  maxLength="5"
                  required
                />
                {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="cvv"
                  placeholder="CVV"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  maxLength="3"
                  required
                />
                {errors.cvv && <span className="error-message">{errors.cvv}</span>}
              </div>
            </div>
          </div>

          <div className="shipping-options">
            <h2>Shipping Method</h2>
            {isFreeShipping ? (
              <div className="free-shipping-message">
                Congratulations! You've qualified for FREE shipping!
              </div>
            ) : (
              <>
                <div className="shipping-option">
                  <input
                    type="radio"
                    id="standard"
                    name="shipping"
                    value="standard"
                    checked={shippingMethod === 'standard'}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
                  <label htmlFor="standard">Standard Shipping ($5.00) - 5-7 business days</label>
                </div>
                <div className="shipping-option">
                  <input
                    type="radio"
                    id="express"
                    name="shipping"
                    value="express"
                    checked={shippingMethod === 'express'}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
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