import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './productpage.css';

import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';

import ShoppingCart from '../../components/ShoppingCart';
import StarRating from '../../components/StarRating';

import axios from 'axios';

export default function ProductPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [displayList, setDisplayList] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortOption, setSortOption] = useState('none');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isBookFavorite, updateFavorites } = useFavorites();

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/products')
      .then((res) => {
        const products = res.data.map((p) => ({ ...p, id: p.isbn }));
        setBooks(products);
        setDisplayList(products);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
        setError('Failed to load products.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let list = [...books];

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(term) ||
          b.author?.toLowerCase().includes(term)
      );
    }

    if (category !== 'all') {
      list = list.filter((b) => b.type === category);
    }

    switch (sortOption) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'points-desc':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'points-asc':
        list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      default:
        break;
    }

    setDisplayList(list);
  }, [books, searchTerm, category, sortOption]);

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
      .then(updateFavorites)
      .catch(console.error);
  };

  if (loading) return <div className="product-page">Loading books…</div>;
  if (error) return <div className="product-page">{error}</div>;

  const categories = ['all', ...new Set(books.map((b) => b.type))];

  return (
    <>
      <div className="product-page">
        <h1>All Books</h1>

        <div className="controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title or author…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">
              <i className="fas fa-search" />
            </button>
          </div>

          <select
            className="control-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <select
            className="control-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="none">Sort</option>
            <option value="price-asc">Price – low → high</option>
            <option value="price-desc">Price – high → low</option>
            <option value="points-desc">Points – high → low</option>
            <option value="points-asc">Points – low → high</option>
          </select>
        </div>

        <div className="book-list">
          {displayList.map((book) => (
            <div className="book-card" key={book.id}>
              <div className="book-image-container">
                <Link to={`/books/${book.id}`}>
                  <img src={book.image} alt={book.title} className="book-image" />
                </Link>
                <button
                  className={`favorite-btn ${isBookFavorite(book.id) ? 'active' : ''}`}
                  onClick={() => handleToggleFavorite(book)}
                >
                  <i className="fas fa-heart" />
                </button>
              </div>

              <div className="book-info">
                <Link to={`/books/${book.id}`} className="book-title">
                  <h3>{book.title}</h3>
                </Link>
                <p className="author">By {book.author}</p>
                <p className="price">${book.price?.toFixed(2)}</p>
                <p className="stock">Stock: {book.stock}</p>

                <div className="rating-wrapper">
                  <StarRating rating={book.rating || 0} />
                </div>

                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(book)}
                  disabled={book.stock === 0}
                >
                  {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
