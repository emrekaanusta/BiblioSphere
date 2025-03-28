import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        const savedFavorites = localStorage.getItem('favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
        console.log("Favorites updated in localStorage:", favorites); // Debug log
    }, [favorites]);

    // Add a book to favorites if it's not already there
    const addToFavorites = (book) => {
        setFavorites(currentFavorites => {
            if (!currentFavorites.some(item => item.id === book.id)) {
                return [...currentFavorites, book];
            }
            return currentFavorites;
        });
    };

    // Remove a book from favorites by its ID
    const removeFromFavorites = (bookId) => {
        setFavorites(currentFavorites => 
            currentFavorites.filter(item => item.id !== bookId)
        );
    };

    // Toggle the visibility of the favorites panel/slider
    const toggleFavorites = () => {
        setIsFavoritesOpen(prev => !prev);
    };

    // Check if a book is in favorites
    const isBookFavorite = (bookId) => {
        return favorites.some(item => item.id === bookId);
    };

    // Overwrite favorites with a new list from the backend
    const updateFavorites = (newFavorites) => {
        setFavorites(newFavorites);
    };

    // NEW: Clear the entire favorites list
    const clearFavorites = () => {
        setFavorites([]);
    };

    const value = {
        favorites,
        isFavoritesOpen,
        addToFavorites,
        removeFromFavorites,
        toggleFavorites,
        isBookFavorite,
        updateFavorites,
        clearFavorites, // Export the clearFavorites function
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};
