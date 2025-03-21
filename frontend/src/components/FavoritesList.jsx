import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import './FavoritesList.css';

const FavoritesList = () => {
    const { favorites, isFavoritesOpen, removeFromFavorites, setIsFavoritesOpen } = useFavorites();
    const navigate = useNavigate();

    // Close favorites list when pressing Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsFavoritesOpen(false);
            }
        };

        if (isFavoritesOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isFavoritesOpen, setIsFavoritesOpen]);

    const handleViewAllFavorites = () => {
        setIsFavoritesOpen(false);
        navigate('/favorites');
    };

    if (!isFavoritesOpen) return null;

    return (
        <>
            <div className="favorites-backdrop" onClick={() => setIsFavoritesOpen(false)} />
            <div className="favorites-list">
                <div className="favorites-header">
                    <h2>Favorite Books</h2>
                    <button className="close-btn" onClick={() => setIsFavoritesOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="favorites-items">
                    {favorites.length > 0 ? (
                        favorites.map((book) => (
                            <div key={book.id} className="favorite-item">
                                <Link 
                                    to={`/book/${book.id}`} 
                                    className="book-image-link"
                                    onClick={() => setIsFavoritesOpen(false)}
                                >
                                    <img src={book.image} alt={book.title} className="favorite-item-image" />
                                </Link>
                                <div className="favorite-item-details">
                                    <Link 
                                        to={`/book/${book.id}`} 
                                        className="book-title"
                                        onClick={() => setIsFavoritesOpen(false)}
                                    >
                                        <h3>{book.title}</h3>
                                    </Link>
                                    <p>${book.price}</p>
                                    <button 
                                        onClick={() => removeFromFavorites(book.id)} 
                                        className="remove-btn"
                                    >
                                        <i className="fas fa-trash-alt"></i>
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