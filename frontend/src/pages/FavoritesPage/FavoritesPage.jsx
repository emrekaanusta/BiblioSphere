import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import './FavoritesPage.css';

const FavoritesPage = () => {
    const { favorites, removeFromFavorites } = useFavorites();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = (book) => {
        const success = addToCart(book);
        if (!success) {
            if (book.stock === 0) {
                alert('This item is out of stock.');
            } else {
                alert(`Cannot add more items. Only ${book.stock} available in stock.`);
            }
        }
    };

    const handleBookClick = (bookId) => {
        navigate(`/books/${bookId}`);
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
                    {favorites.map((book) => (
                        <div key={book.id || book.isbn || book._id} className="favorite-book-card">
                            <div 
                                className="book-image-container"
                                onClick={() => handleBookClick(book.id || book.isbn || book._id)}
                            >
                                <img src={book.image} alt={book.title} className="book-image" />
                            </div>
                            <div className="book-info">
                                <div 
                                    className="book-title"
                                    onClick={() => handleBookClick(book.id || book.isbn || book._id)}
                                >
                                    <h3>{book.title}</h3>
                                </div>
                                <p className="book-price">${book.price}</p>
                                <p className="stock">Stock: {book.stock}</p>
                                <div className="book-actions">
                                    <button 
                                        onClick={() => handleAddToCart(book)}
                                        className="add-to-cart-btn"
                                        disabled={book.stock === 0}
                                    >
                                        <i className="fas fa-shopping-cart"></i>
                                        {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                    <button 
                                        onClick={() => removeFromFavorites(book.id || book.isbn || book._id)}
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