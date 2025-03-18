import React from 'react';

const ShoppingCart = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

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
                    {/* Sample items - you can modify these */}
                    <div className="cart-item">
                        <img src="/images/book1.jpg" alt="Book 1" />
                        <div className="item-details">
                            <h4>Book Title 1</h4>
                            <p className="price">$15.99</p>
                            <div className="quantity">
                                <button>-</button>
                                <span>1</span>
                                <button>+</button>
                            </div>
                        </div>
                        <button className="remove-btn">
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div className="cart-footer">
                    <div className="total">
                        <span>Total:</span>
                        <span>$15.99</span>
                    </div>
                    <button className="btn checkout-btn">Checkout</button>
                </div>
            </div>
        </div>
    );
};

export default ShoppingCart; 