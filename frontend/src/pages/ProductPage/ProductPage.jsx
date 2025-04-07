import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './productpage.css';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import ShoppingCart from '../../components/ShoppingCart';
import axios from 'axios';

const ProductPage = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const navigate = useNavigate();

    // State to hold books fetched from backend
    const [books, setBooks] = useState([]);
    // Optional: track loading or errors
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { addToCart } = useCart();
    const { isBookFavorite, updateFavorites } = useFavorites();

    // Fetch books from your backend on component mount
    useEffect(() => {
        axios
            .get('http://localhost:8080/api/products') // Adjust if your endpoint is different
            .then((res) => {
                // If your unique ID is `isbn`, you can map it so your code continues to use `book.id`
                const dataWithIds = res.data.map((b) => ({
                    ...b,
                    id: b.isbn, // reuse the "id" in your front-end
                }));
                setBooks(dataWithIds);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching books:', err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleAddToCart = (book) => {
        addToCart(book);
        setIsCartOpen(true);
    };

    const handleToggleFavorite = (book) => {
        const token = localStorage.getItem('token');
        if (!token) {
            // User not logged in, so redirect to the login page.
            navigate('/login');
            return;
        }

        // If the book is already favorited, we should remove it, otherwise add it.
        // Using fetch below, but you could also do this via axios.
        const endpoint = isBookFavorite(book.id) ? 'remove' : 'add';

        fetch(`http://localhost:8080/favorites/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId: book.id.toString() }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Error ${endpoint === 'add' ? 'adding' : 'removing'} product from wishlist`
                    );
                }
                return response.json();
            })
            .then((updatedFavorites) => {
                updateFavorites(updatedFavorites);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    if (loading) {
        return <div>Loading books...</div>;
    }

    if (error) {
        return <div>Error loading books: {error}</div>;
    }

    return (
        <>
            <div className="product-page">
                <h1>All Books</h1>
                {/* Search Bar */}
                <div className="search-bar">
                    <input type="text" placeholder="Search by title or author..." />
                    <button className="search-btn">
                        <i className="fas fa-search"></i>
                    </button>
                </div>

                {/* Filter and Sort Controls (optional) */}
                <div className="filters">
                    {/* Add filter controls if needed */}
                </div>

                {/* Book List */}
                <div className="book-list">
                    {books.map((book) => (
                        <div className="book-item" key={book.id}>
                            <div className="book-image-container">
                                {/* Link to the detail page using the new ID (isbn) */}
                                <Link to={`/book/${book.id}`}>
                                    <img src={book.image} alt={book.title} className="book-image" />
                                </Link>
                                <button
                                    className={`favorite-btn ${isBookFavorite(book.id) ? 'active' : ''}`}
                                    onClick={() => handleToggleFavorite(book)}
                                >
                                    <i className="fas fa-heart"></i>
                                </button>
                            </div>
                            {/* Another link to the detail page */}
                            <Link to={`/book/${book.id}`} className="book-title">
                                <h3>{book.title}</h3>
                            </Link>
                            <p>Author: {book.author}</p>
                            <p>Type: {book.type}</p>
                            <p className="price">Price: ${book.price?.toFixed(2)}</p>
                            <button className="btn" onClick={() => handleAddToCart(book)}>
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
};

export default ProductPage;
