import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import './FavoritesPage.css';

const FavoritesPage = () => {
    const { favorites, removeFromFavorites } = useFavorites();
    const { addToCart } = useCart();

    const handleAddToCart = (book) => {
        addToCart(book);
    };

    return (
        <div className="favorites-page">
            <h1>My Favorite Books</h1>
            {favorites.length === 0 ? (
                <div className="empty-favorites-message">
                    <i className="fas fa-heart-broken"></i>
                    <p>You haven't added any books to your favorites yet.</p>
                </div>
            ) : (
                <div className="favorites-grid">
                    {favorites.map(book => (
                        <div key={book.id} className="favorite-book-card">
                            <Link to={`/book/${book.id}`} className="book-image-link">
                                <img src={book.image} alt={book.title} className="book-image" />
                            </Link>
                            <div className="book-info">
                                <Link to={`/book/${book.id}`} className="book-title">
                                    <h3>{book.title}</h3>
                                </Link>
                                <p className="book-price">${book.price}</p>
                                <div className="book-actions">
                                    <button 
                                        onClick={() => handleAddToCart(book)}
                                        className="add-to-cart-btn"
                                    >
                                        <i className="fas fa-shopping-cart"></i>
                                        Add to Cart
                                    </button>
                                    <button 
                                        onClick={() => removeFromFavorites(book.id)}
                                        className="remove-btn"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage; 