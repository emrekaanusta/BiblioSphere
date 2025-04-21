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
        const token = localStorage.getItem('token');
        const savedCart = localStorage.getItem('cart');
        // Only restore cart if user is logged in
        return token && savedCart ? JSON.parse(savedCart) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [shippingMethod, setShippingMethod] = useState(() => {
        const savedMethod = localStorage.getItem('shippingMethod');
        return savedMethod || 'standard';
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('shippingMethod', shippingMethod);
    }, [shippingMethod]);

    const shippingRates = {
        standard: 5,
        express: 15
    };

    const addToCart = (product) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.id === product.id);
            if (existingItem) {
                return currentCart.map(item =>
                    item.id === product.id
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
        setCart(currentCart => currentCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(currentCart =>
            currentCart.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };


    const getShippingCost = () => {
        const subtotal = getSubtotal();
        if (subtotal >= 100) return 0;
        return shippingMethod === "express" ? 15 : 5;
      };
      

    const getSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartTotal = () => {
        const subtotal = getSubtotal();
        return subtotal;
    };

    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
    };

    const clearCart = () => {
        console.log('Clearing cart - current cart state:', cart);
        setCart([]);
        localStorage.removeItem('cart');
        console.log('Cart cleared - new cart state:', []);
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
        setShippingMethod,
        shippingRates,
        getShippingCost
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 