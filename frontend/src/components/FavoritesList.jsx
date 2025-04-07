import React from 'react';
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

    const handleViewAllFavorites = () => {
        toggleFavorites(); // Close the slider
        navigate('/favorites'); // Navigate to favorites page
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
                            <div key={book.id} className="favorite-item">
                                <Link to={`/book/${book.id}`}>
                                    <img src={book.image} alt={book.title} className="favorite-item-image" />
                                </Link>
                                <div className="favorite-item-details">
                                    <Link to={`/book/${book.id}`} className="book-title">
                                        <h3>{book.title}</h3>
                                    </Link>
                                    <p>${book.price}</p>
                                    <button 
                                        onClick={() => removeFromFavorites(book.id)} 
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