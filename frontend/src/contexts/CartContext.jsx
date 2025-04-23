import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [shippingMethod, setShippingMethod] = useState(() => {
        const savedMethod = localStorage.getItem('shippingMethod');
        return savedMethod || 'standard';
    });
    const [shippingCost, setShippingCost] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('shippingMethod', shippingMethod);
        const newShippingCost = calculateShippingCost();
        setShippingCost(newShippingCost);
        setTotal(getSubtotal() + newShippingCost);
    }, [shippingMethod, cart]);

    const shippingRates = {
        standard: 5,
        express: 15
    };

    const calculateShippingCost = () => {
        const subtotal = getSubtotal();
        if (subtotal >= 100) return 0;
        return shippingMethod === "express" ? 15 : 5;
    };

    const addToCart = (product) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.isbn === product.isbn);
            if (existingItem) {
                return currentCart.map(item =>
                    item.isbn === product.isbn
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...currentCart, { ...product, quantity: 1 }];
        });
        if (!isCartOpen) {
            setIsCartOpen(true);
        }
    };

    const removeFromCart = (productId) => {
        setCart(currentCart => currentCart.filter(item => item.isbn !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(currentCart =>
            currentCart.map(item =>
                item.isbn === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const getShippingCost = () => {
        return shippingCost;
    };

    const getSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartTotal = () => {
        return total;
    };

    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    const updateShippingMethod = (method) => {
        setShippingMethod(method);
        const newShippingCost = calculateShippingCost();
        setShippingCost(newShippingCost);
        setTotal(getSubtotal() + newShippingCost);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        isCartOpen,
        toggleCart,
        clearCart,
        getSubtotal,
        shippingMethod,
        updateShippingMethod,
        shippingRates,
        getShippingCost,
        getSubtotal,
        shippingCost,
        total
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 