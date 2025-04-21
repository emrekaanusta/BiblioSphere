import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import axios from 'axios';
import BookRatingSection from '../../components/BookRatingSection';
import StarRating from '../../components/StarRating';

import './BookDetailPage.css';

const BookDetailPage = () => {
    // We'll treat bookId from the URL as the book's ISBN
    const { bookId } = useParams();
    const navigate = useNavigate();

    const { addToCart } = useCart();
    const { addToFavorites, removeFromFavorites, isBookFavorite } = useFavorites();

    // State to hold the fetched book data
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch the book data from the backend when this component mounts or bookId changes
    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/products/${bookId}`)
            .then((response) => {
                setBook(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching book:', error);
                setLoading(false);
            });
    }, [bookId]);


    const handleAddToCart = () => {
        if (book) {
            addToCart(book);
        }
    };

    const handleToggleFavorite = () => {
        if (!book) return;
        if (isBookFavorite(book.isbn)) {
            removeFromFavorites(book.isbn);
        } else {
            addToFavorites(book);
        }
    };

    const scrollToReviews = () => {
        const reviewsSection = document.getElementById('reviews');
        if (reviewsSection) {
            reviewsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return <div>Loading book details...</div>;
    }

    if (!book) {
        return <div>Book not found.</div>;
    }

    return (
        <div className="book-detail-page">
            <header className="header">
                <section className="header-1">
                    <Link to="/" className="logo">
                        <i className="fas fa-book"></i> BiblioSphere
                    </Link>
                    <div className="icons">
                        <Link to="/favorites" className="fas fa-heart"></Link>
                        <Link to="/cart" className="fas fa-shopping-cart"></Link>
                        <Link to="/profile" className="fas fa-user"></Link>
                    </div>
                </section>
            </header>

            <div className="book-detail-container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left"></i>
                </button>
                <div className="book-image-section">
                    <img src={book.image} alt={book.title} className="book-cover" />
                    <div className="book-actions">
                        <button className="add-to-cart-btn" onClick={handleAddToCart}>
                            Add to Cart - ${book.price}
                        </button>
                        <button
                            className={`favorite-btn ${isBookFavorite(book.isbn) ? 'active' : ''}`}
                            onClick={handleToggleFavorite}
                        >
                            <i className="fas fa-heart"></i>
                        </button>
                    </div>
                </div>

                <div className="book-info-section">
                    <div className="title-author">
                        <h1>{book.title}</h1>
                        <h2>By {book.author}</h2>
                    </div>
                    <div className="book-rating" onClick={scrollToReviews}>
                        <StarRating rating={book.rating || 0} />
                        <span className="rating-count">
                            ({book.reviews?.length || 0} {book.reviews?.length === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>
                    <div className="book-meta">
                        <span>
                            <i className="fas fa-bookmark"></i> {book.type}
                        </span>
                        <span>
                            <i className="fas fa-calendar"></i> {book.publisYear}
                        </span>
                        <span>
                            <i className="fas fa-language"></i> {book.language}
                        </span>
                    </div>

                    <div className="book-description">
                        <h3>About this book</h3>
                        <p>{book.description}</p>
                    </div>

                    <div className="book-details">
                        <h3>Product Details</h3>
                        <table>
                            <tbody>
                            <tr>
                                <td>ISBN:</td>
                                <td>{book.isbn}</td>
                            </tr>
                            <tr>
                                <td>Publisher:</td>
                                <td>{book.publisher}</td>
                            </tr>
                            <tr>
                                <td>Publication Year:</td>
                                <td>{book.publisYear}</td>
                            </tr>
                            <tr>
                                <td>Pages:</td>
                                <td>{book.pages}</td>
                            </tr>
                            <tr>
                                <td>Language:</td>
                                <td>{book.language}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <BookRatingSection bookId={bookId} />
        </div>
    );
};

export default BookDetailPage;
