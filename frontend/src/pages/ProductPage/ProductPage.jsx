import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './productpage.css';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import ShoppingCart from '../../components/ShoppingCart';
import StarRating from '../../components/StarRating';
import axios from 'axios';

const ProductPage = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isBookFavorite, updateFavorites } = useFavorites();

  // Fetch products from backend
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/products')
      .then((res) => {
        const products = res.data.map((p) => ({
          ...p,
          id: p.isbn, // make sure each product has a unique id for rendering and linking
        }));
        setBooks(products);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
        setError('Failed to load products.');
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
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update wishlist');
        return res.json();
      })
      .then((updatedFavorites) => {
        updateFavorites(updatedFavorites);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  if (loading) return <div>Loading books...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div className="product-page">
        <h1>All Books</h1>

        <div className="search-bar">
          <input type="text" placeholder="Search by title or author..." />
          <button className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="filters">{/* Optional filter UI */}</div>

        <div className="book-list">
          {books.map((book) => (
            <div className="book-item" key={book.id}>
              <div className="book-image-container">
                <Link to={`/books/${book.id}`}>
                  <img src={book.image} alt={book.title} className="book-image" />
                </Link>
                <button
                  className={`favorite-btn ${isBookFavorite(book.id) ? 'active' : ''}`}
                  onClick={() => handleToggleFavorite(book)}
                >
                  <i className="fas fa-heart"></i>
                </button>
              </div>
              <Link to={`/books/${book.id}`} className="book-title">
                <h3>{book.title}</h3>
              </Link>
              <p>Author: {book.author}</p>
              <p>Genre: {book.type}</p>
              <p>Year: {book.publisYear}</p>
              <p className="price">Price: ${book.price?.toFixed(2)}</p>
              <StarRating rating={book.rating || 0} />
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
