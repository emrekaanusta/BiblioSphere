import React, { useEffect } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useNavigate, Link } from 'react-router-dom';
import './FavoritesList.css';

const FavoritesList = () => {
    const { 
        favorites, 
        removeFromFavorites, 
        isFavoritesOpen, 
        toggleFavorites 
    } = useFavorites();
    const navigate = useNavigate();

    // Open the slider when favorites change
    useEffect(() => {
        if (favorites.length > 0) {
            toggleFavorites();
        }
    }, [favorites.length]);

    const handleViewAllFavorites = () => {
        toggleFavorites(); // Close the slider
        navigate('/favorites'); // Navigate to favorites page
    };

    const handleBookClick = (bookId) => {
        toggleFavorites(); // Close the slider
        navigate(`/books/${bookId}`); // Navigate to book detail page
    };

    return (
        <>
            <div className={`favorites-overlay ${isFavoritesOpen ? 'open' : ''}`} onClick={toggleFavorites}></div>
            <div className={`favorites-panel ${isFavoritesOpen ? 'open' : ''}`}>
                <div className="favorites-header">
                    <h2>My Favorites</h2>
                    <button onClick={toggleFavorites} className="close-btn">&times;</button>
                </div>
                
                <div className="favorites-items">
                    {favorites.length > 0 ? (
                        favorites.map((book) => (
                            <div key={book.id || book.isbn || book._id} className="favorite-item">
                                <div 
                                    className="favorite-item-image-container"
                                    onClick={() => handleBookClick(book.id || book.isbn || book._id)}
                                >
                                    <img src={book.image} alt={book.title} className="favorite-item-image" />
                                </div>
                                <div className="favorite-item-details">
                                    <div 
                                        className="book-title"
                                        onClick={() => handleBookClick(book.id || book.isbn || book._id)}
                                    >
                                        <h3>{book.title}</h3>
                                    </div>
                                    <p>${book.price}</p>
                                    <button 
                                        onClick={() => removeFromFavorites(book.id || book.isbn || book._id)} 
                                        className="remove-btn"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-favorites">
                            <p>No favorite books yet</p>
                        </div>
                    )}
                </div>

                {favorites.length > 0 && (
                    <div className="favorites-footer">
                        <button onClick={handleViewAllFavorites} className="view-all-btn">
                            <i className="fas fa-heart"></i>
                            View All Favorites
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default FavoritesList;