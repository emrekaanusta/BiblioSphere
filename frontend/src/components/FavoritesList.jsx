import React from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import './FavoritesList.css';

const FavoritesList = () => {
    const { 
        favorites, 
        removeFromFavorites, 
        isFavoritesOpen, 
        toggleFavorites 
    } = useFavorites();

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
                                <img src={book.image} alt={book.title} className="favorite-item-image" />
                                <div className="favorite-item-details">
                                    <h3>{book.title}</h3>
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
            </div>
        </>
    );
};

export default FavoritesList; 