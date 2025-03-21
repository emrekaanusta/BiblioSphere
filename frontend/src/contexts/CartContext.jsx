import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [shippingMethod, setShippingMethod] = useState('standard'); // 'standard', 'express', 'overnight'

    const shippingRates = {
        standard: { base: 4.99, itemRate: 0.50 },
        express: { base: 9.99, itemRate: 1.00 },
        overnight: { base: 19.99, itemRate: 2.00 }
    };

    const addToCart = (book) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === book.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === book.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...book, quantity: 1 }];
        });
    };

    const removeFromCart = (bookId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== bookId));
    };

    const updateQuantity = (bookId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(bookId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === bookId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const calculateShipping = () => {
        const rate = shippingRates[shippingMethod];
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        return rate.base + (totalItems * rate.itemRate);
    };

    const getSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartTotal = () => {
        const subtotal = getSubtotal();
        const shipping = calculateShipping();
        return subtotal + shipping;
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            getCartTotal,
            getSubtotal,
            calculateShipping,
            shippingMethod,
            setShippingMethod,
            shippingRates
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 