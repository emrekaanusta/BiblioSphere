import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

const ShoppingCart = ({ isOpen, onClose }) => {
    const { 
        cartItems, 
        removeFromCart, 
        updateQuantity, 
        getCartTotal,
        getSubtotal,
        calculateShipping,
        shippingMethod,
        setShippingMethod,
        shippingRates
    } = useCart();

    if (!isOpen) return null;

    const subtotal = getSubtotal();
    const shipping = calculateShipping();
    const total = getCartTotal();

    return (
        <div className="shopping-cart-container">
            <div className="shopping-cart">
                <div className="cart-header">
                    <h3>Shopping Cart</h3>
                    <button onClick={onClose} className="close-btn">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="cart-item">
                                <img src={item.image} alt={item.title} />
                                <div className="item-details">
                                    <h4>{item.title}</h4>
                                    <p className="price">${item.price.toFixed(2)}</p>
                                    <div className="quantity">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                    </div>
                                </div>
                                <button 
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>
                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        <div className="shipping-options">
                            <h4>Shipping Method</h4>
                            <select 
                                value={shippingMethod} 
                                onChange={(e) => setShippingMethod(e.target.value)}
                                className="shipping-select"
                            >
                                <option value="standard">Standard Shipping (2-5 days)</option>
                                <option value="express">Express Shipping (1-2 days)</option>
                                <option value="overnight">Overnight Shipping</option>
                            </select>
                        </div>
                        <div className="price-summary">
                            <div className="subtotal">
                                <span>Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="shipping">
                                <span>Shipping:</span>
                                <span>${shipping.toFixed(2)}</span>
                            </div>
                            <div className="total">
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <Link to="/checkout" className="btn checkout-btn" onClick={onClose}>
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShoppingCart; 