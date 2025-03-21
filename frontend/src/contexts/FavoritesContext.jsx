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

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addToFavorites = (book) => {
        setFavorites(currentFavorites => {
            if (!currentFavorites.some(item => item.id === book.id)) {
                return [...currentFavorites, book];
            }
            return currentFavorites;
        });
    };

    const removeFromFavorites = (bookId) => {
        setFavorites(currentFavorites => 
            currentFavorites.filter(item => item.id !== bookId)
        );
    };

    const toggleFavorites = () => {
        setIsFavoritesOpen(prev => !prev);
    };

    const isBookFavorite = (bookId) => {
        return favorites.some(item => item.id === bookId);
    };

    const value = {
        favorites,
        isFavoritesOpen,
        addToFavorites,
        removeFromFavorites,
        toggleFavorites,
        isBookFavorite
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}; 