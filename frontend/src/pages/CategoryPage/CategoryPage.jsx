import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import axios from 'axios';

import './CategoryPage.css';

const CategoryPage = () => {
  const { category } = useParams();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isBookFavorite } = useFavorites();

  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/products')
      .then(res => {
        setBooks(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching books:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading books…</div>;
  if (error)   return <div className="error">Error: {error}</div>;

  // Derive primary category (before any slash) and compare to URL param
  const categoryBooks = books.filter(book => {
    const mainCat = book.type.split('/')[0].trim().toLowerCase();
    return mainCat === category.toLowerCase();
  });

  return (
    <div className="category-page">
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

      <div className="category-container">
        <div className="category-header">
          <Link to="/" className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <h1>
            {category.charAt(0).toUpperCase() + category.slice(1)} Books
          </h1>
        </div>

        <div className="category-books">
          {categoryBooks.length > 0 ? (
            categoryBooks.map(book => (
              <div key={book.isbn} className="book-card">
                <div className="book-image-container">
                  <Link to={`/book/${book.isbn}`}>
                    <img
                      src={book.image}
                      alt={book.title}
                      className="book-image"
                    />
                  </Link>
                  <button
                    className={`favorite-btn ${
                      isBookFavorite(book.isbn) ? 'active' : ''
                    }`}
                    onClick={() =>
                      isBookFavorite(book.isbn)
                        ? removeFromFavorites(book.isbn)
                        : addToFavorites(book)
                    }
                  >
                    <i className="fas fa-heart"></i>
                  </button>
                </div>
                <div className="book-info">
                  <Link to={`/book/${book.isbn}`} className="book-title">
                    <h3>{book.title}</h3>
                  </Link>
                  <p className="author">by {book.author}</p>
                  <p className="price">${book.price.toFixed(2)}</p>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(book)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              No books found in “{category}”
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
