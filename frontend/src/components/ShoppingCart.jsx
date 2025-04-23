import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './ShoppingCart.css';

const ShoppingCart = () => {
    const { 
        cart, 
        removeFromCart, 
        updateQuantity, 
        isCartOpen, 
        toggleCart,
        getCartTotal,
        shippingMethod,
        updateShippingMethod,
        getSubtotal,
        shippingCost,
        total,
        warning,
        showWarning
    } = useCart();
    const navigate = useNavigate();

    const [subtotal, setSubtotal] = useState(0);
    const [isFreeShipping, setIsFreeShipping] = useState(false);

    useEffect(() => {
        const newSubtotal = getSubtotal();
        setSubtotal(newSubtotal);
        setIsFreeShipping(newSubtotal >= 100);
    }, [cart, getSubtotal]);

    const handleShippingMethodChange = (method) => {
        updateShippingMethod(method);
    };

    const handleCheckout = () => {
        const token = localStorage.getItem('token');
        toggleCart();
        if (!token) {
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    const handleQuantityChange = (item, newQuantity) => {
        if (newQuantity > item.stock) {
            showWarning(`Cannot add more items. Only ${item.stock} available in stock.`);
            return;
        }
        updateQuantity(item.isbn, newQuantity);
    };

    return (
        <>
            <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={toggleCart}></div>
            <div className={`shopping-cart ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Shopping Cart</h2>
                    <button onClick={toggleCart} className="close-btn">&times;</button>
                </div>
                
                <div className="cart-items">
                    {cart && cart.length > 0 ? cart.map((item, index) => (
                        <div key={`${item.isbn}-${index}`} className="cart-item">
                            <img src={item.image} alt={item.title} className="cart-item-image" />
                            <div className="cart-item-details">
                                <h3>{item.title}</h3>
                                <p>Price: ${item.price}</p>
                                <div className="quantity-controls">
                                    <button 
                                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        +
                                    </button>
                                </div>
                                <p>Stock: {item.stock}</p>
                                <button onClick={() => removeFromCart(item.isbn)} className="remove-btn">Remove</button>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-cart">
                            <p>Your cart is empty</p>
                        </div>
                    )}
                </div>

                {cart && cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="shipping-options">
                            <h3>Shipping Method</h3>
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
                                            onChange={() => handleShippingMethodChange('standard')}
                                        />
                                        <label htmlFor="standard">Standard Shipping ($5.00)</label>
                                    </div>
                                    <div className="shipping-option">
                                        <input
                                            type="radio"
                                            id="express"
                                            name="shipping"
                                            value="express"
                                            checked={shippingMethod === 'express'}
                                            onChange={() => handleShippingMethodChange('express')}
                                        />
                                        <label htmlFor="express">Express Shipping ($15.00)</label>
                                    </div>
                                    <div className="free-shipping-notice">
                                        Add ${(100 - subtotal).toFixed(2)} more to get FREE shipping!
                                    </div>
                                </>
                            )}
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
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                if (cart.some(item => item.stock === 0)) {
                                    showWarning("Cannot proceed with out-of-stock items in cart");
                                } else {
                                    handleCheckout();
                                }
                            }}
                            className="checkout-btn"
                            disabled={cart.some(item => item.stock === 0)}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
            {warning && (
                <div className="warning-popup">
                    {warning}
                </div>
            )}
        </>
    );
};

export default ShoppingCart; 