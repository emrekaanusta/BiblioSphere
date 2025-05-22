import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

    // Save favorites to localStorage and sync with backend whenever they change
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
        console.log("Favorites updated in localStorage:", favorites);

        // Sync with backend if user is logged in
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');
        if (token && userEmail) {
            favorites.forEach(book => {
                axios.post('http://localhost:8080/api/wishlist-cluster/update', null, {
                    params: {
                        userEmail: userEmail,
                        bookId: book.id,
                        isAdding: true
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).catch(error => {
                    console.error('Error syncing wishlist with backend:', error);
                });
            });
        }
    }, [favorites]);

    // Add a book to favorites if it's not already there
    const addToFavorites = async (book) => {
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');

        if (token && userEmail) {
            try {
                await axios.post('http://localhost:8080/api/wishlist-cluster/update', null, {
                    params: {
                        userEmail: userEmail,
                        bookId: book.id,
                        isAdding: true
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Error updating wishlist cluster:', error);
            }
        }

        setFavorites(currentFavorites => {
            if (!currentFavorites.some(item => item.id === book.id)) {
                return [...currentFavorites, book];
            }
            return currentFavorites;
        });
    };

    // Remove a book from favorites by its ID
    const removeFromFavorites = async (bookId) => {
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');

        if (token && userEmail) {
            try {
                await axios.post('http://localhost:8080/api/wishlist-cluster/update', null, {
                    params: {
                        userEmail: userEmail,
                        bookId: bookId,
                        isAdding: false
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Error updating wishlist cluster:', error);
            }
        }

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

    // Clear the entire favorites list
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
        clearFavorites,
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};
