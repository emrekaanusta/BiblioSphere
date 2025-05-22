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

// Helper function to get the book ID consistently
const getBookId = (book) => {
    return book.id || book.isbn || book._id;
};

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        const savedFavorites = localStorage.getItem('favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

    // Load favorites from backend when user logs in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');

        if (token && userEmail) {
            // First get the wishlist cluster from backend
            axios.get(`http://localhost:8080/api/wishlist-cluster/${userEmail}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                const wishlistCluster = response.data;
                if (wishlistCluster && wishlistCluster.wishlist && wishlistCluster.wishlist.length > 0) {
                    // For each book ID in the wishlist, fetch the book details
                    const bookPromises = wishlistCluster.wishlist.map(bookId =>
                        axios.get(`http://localhost:8080/api/products/${bookId}`)
                    );

                    Promise.all(bookPromises)
                        .then(bookResponses => {
                            const books = bookResponses.map(response => response.data);
                            setFavorites(books);
                            localStorage.setItem('favorites', JSON.stringify(books));
                        })
                        .catch(error => {
                            console.error('Error fetching book details:', error);
                        });
                }
            })
            .catch(error => {
                console.error('Error fetching wishlist cluster:', error);
            });
        }
    }, []); // Empty dependency array means this runs once when component mounts

    // Save favorites to localStorage and sync with backend whenever they change
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
        console.log("Favorites updated in localStorage:", favorites);

        // Sync with backend if user is logged in
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');
        if (token && userEmail) {
            favorites.forEach(book => {
                const bookId = getBookId(book);
                axios.post('http://localhost:8080/api/wishlist-cluster/update', null, {
                    params: {
                        userEmail: userEmail,
                        bookId: bookId,
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
        const bookId = getBookId(book);

        if (token && userEmail) {
            try {
                await axios.post('http://localhost:8080/api/wishlist-cluster/update', null, {
                    params: {
                        userEmail: userEmail,
                        bookId: bookId,
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
            if (!currentFavorites.some(item => getBookId(item) === bookId)) {
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
            currentFavorites.filter(item => getBookId(item) !== bookId)
        );
    };

    // Toggle the visibility of the favorites panel/slider
    const toggleFavorites = () => {
        setIsFavoritesOpen(prev => !prev);
    };

    // Check if a book is in favorites
    const isBookFavorite = (bookId) => {
        return favorites.some(item => getBookId(item) === bookId);
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
