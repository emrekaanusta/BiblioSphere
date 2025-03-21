import React from 'react';
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
        setShippingMethod
    } = useCart();
    const navigate = useNavigate();

    const subtotal = getCartTotal();
    const shippingCost = shippingMethod === 'express' ? 15 : shippingMethod === 'standard' ? 5 : 0;
    const total = subtotal + shippingCost;

    const handleCheckout = () => {
        toggleCart();
        navigate('/checkout');
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
                    {cart && cart.length > 0 ? cart.map((item) => (
                        <div key={item.id} className="cart-item">
                            <img src={item.image} alt={item.title} className="cart-item-image" />
                            <div className="cart-item-details">
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
                            <div className="shipping-option">
                                <input
                                    type="radio"
                                    id="standard"
                                    name="shipping"
                                    value="standard"
                                    checked={shippingMethod === 'standard'}
                                    onChange={(e) => setShippingMethod(e.target.value)}
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
                                    onChange={(e) => setShippingMethod(e.target.value)}
                                />
                                <label htmlFor="express">Express Shipping ($15.00)</label>
                            </div>
                        </div>

                        <div className="price-summary">
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping:</span>
                                <span>${shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button onClick={handleCheckout} className="checkout-btn">
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default ShoppingCart; 