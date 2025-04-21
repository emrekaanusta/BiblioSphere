import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './productpage.css';

import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';

import ShoppingCart from '../../components/ShoppingCart';
import StarRating from '../../components/StarRating';

import axios from 'axios';

export default function ProductPage() {
  /* ───────── state ───────── */
  const [isCartOpen,   setIsCartOpen]   = useState(false);
  const [books,        setBooks]        = useState([]);
  const [displayList,  setDisplayList]  = useState([]);

  /* UI controls */
  const [searchTerm,   setSearchTerm]   = useState('');
  const [category,     setCategory]     = useState('all');
  const [sortOption,   setSortOption]   = useState('none');      // price‑asc | points‑desc …

  /* meta */
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  /* contexts */
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isBookFavorite, updateFavorites } = useFavorites();

  /* ───── fetch books on mount ───── */
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

  /* ───── recompute list whenever controls change ───── */
  useEffect(() => {
    let list = [...books];

    /* 1 – search */
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(term) ||
          b.author?.toLowerCase().includes(term)
      );
    }

    /* 2 – category */
    if (category !== 'all') {
      list = list.filter((b) => b.type === category);
    }

    /* 3 – sort */
    switch (sortOption) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'points-desc':               // highest rating first
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

  /* ───── handlers ───── */
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

  /* ───── UI ───── */
  if (loading) return <div>Loading books…</div>;
  if (error)   return <div>{error}</div>;

  const categories = ['all', ...new Set(books.map((b) => b.type))];

  return (
    <>
      <div className="product-page">
        <h1>All Books</h1>

        {/* controls row */}
        <div className="controls">
          {/* search */}
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

          {/* category filter */}
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

          {/* sort dropdown */}
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

        {/* grid */}
        <div className="book-list">
          {displayList.map((book) => (
            <div className="book-item" key={book.id}>
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

              <Link to={`/books/${book.id}`} className="book-title">
                <h3>{book.title}</h3>
              </Link>

              <p>Author: {book.author}</p>
              <p>Genre:  {book.type}</p>
              <p>Year:   {book.publishYear ?? book.publisYear}</p>
              <p className="price">Price: ${book.price?.toFixed(2)}</p>
              <p className="stock">
                {book.stock > 0 ? `Stock: ${book.stock}` : 'Out of stock'}
              </p>

              <StarRating rating={book.rating || 0} />

              <button
                className="btn"
                disabled={book.stock === 0}
                onClick={() => handleAddToCart(book)}
              >
                {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
