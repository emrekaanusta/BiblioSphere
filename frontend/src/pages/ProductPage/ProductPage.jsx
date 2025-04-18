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
  const [books, setBooks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Search term state
  const [searchTerm, setSearchTerm] = useState('');

  const { addToCart } = useCart();
  const { isBookFavorite, updateFavorites } = useFavorites();

  // Fetch books from your backend on component mount
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/products')
      .then((res) => {
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
      navigate('/login');
      return;
    }

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

  // Filter books by searchTerm (title or author)
  const filteredBooks = books.filter((book) => {
    const term = searchTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term)
    );
  });

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
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="search-btn"
            onClick={() => {}}
            aria-label="Search"
          >
            <i className="fas fa-search"></i>
          </button>
        </div>

        {/* Book List */}
        <div className="book-list">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div className="book-item" key={book.id}>
                <div className="book-image-container">
                  <Link to={`/book/${book.id}`}>
                    <img
                      src={book.image}
                      alt={book.title}
                      className="book-image"
                    />
                  </Link>
                  <button
                    className={`favorite-btn ${
                      isBookFavorite(book.id) ? 'active' : ''
                    }`}
                    onClick={() => handleToggleFavorite(book)}
                  >
                    <i className="fas fa-heart"></i>
                  </button>
                </div>
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
            ))
          ) : (
            <div className="no-results">No books match your search.</div>
          )}
        </div>
      </div>

      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default ProductPage;
