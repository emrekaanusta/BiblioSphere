import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import StarRating from '../../components/StarRating';

import './CategoryPage.css';

export default function CategoryPage() {
  /* ───── route & contexts ───── */
  const { category } = useParams();
  const navigate     = useNavigate();
  const { addToCart } = useCart();
  const { isBookFavorite, updateFavorites, removeFromFavorites, addToFavorites } = useFavorites();

  /* ───── state ───── */
  const [books,       setBooks]       = useState([]);
  const [displayList, setDisplayList] = useState([]);

  /* UI controls */
  const [searchTerm,  setSearchTerm]  = useState('');
  const [sortOption,  setSortOption]  = useState('none');   // price‑asc / points‑desc …

  /* meta */
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  /* ───── fetch all books once ───── */
  useEffect(() => {
    axios
      .get('http://localhost:8080/api/products')
      .then((res) => {
        const products = res.data.map((p) => ({ ...p, id: p.isbn }));
        setBooks(products);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
        setError('Failed to load books.');
        setLoading(false);
      });
  }, []);

  /* ───── filter + sort whenever deps change ───── */
  useEffect(() => {
    if (loading) return;

    const cat = decodeURIComponent(category).toLowerCase();

    /* 1 – category filter */
    let list = books.filter((b) => {
      if (!b.type) return false;
      const pieces = b.type
        .split(/[\/&,+]/)
        .map((s) => s.trim().toLowerCase());
      return pieces.includes(cat);
    });

    /* 2 – search */
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(term) ||
          b.author?.toLowerCase().includes(term) ||
          b.description?.toLowerCase().includes(term)
      );
    }

    /* 3 – sort */
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
  }, [books, category, searchTerm, sortOption, loading]);

  /* ───── handlers ───── */
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

  const handleToggleFavorite = (book) => {
    if (!localStorage.getItem('token')) {
      alert('Please log in to add books to your favorites');
      navigate('/login');
      return;
    }
    if (isBookFavorite(book.id)) {
      removeFromFavorites(book.id);
    } else {
      addToFavorites(book);
    }
  };

  /* ───── UI ───── */
  if (loading) return <div className="category-page">Loading books…</div>;
  if (error)   return <div className="category-page">{error}</div>;

  return (
    <div className="category-page">
      <header className="header">
        <section className="header-1">
          <Link to="/" className="logo">
            <i className="fas fa-book"></i> BiblioSphere
          </Link>
          <div className="icons">
            <Link to="/favorites" className="fas fa-heart"></Link>
            <Link to="/cart"      className="fas fa-shopping-cart"></Link>
            <Link to="/profile"   className="fas fa-user"></Link>
          </div>
        </section>
      </header>

      {/* controls: search + sort only */}
      <div className="controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search this category…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <select
          className="control-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="none">Sort</option>
          <option value="price-asc">Price – low → high</option>
          <option value="price-desc">Price – high → low</option>
          <option value="points-desc">Points – high → low</option>
          <option value="points-asc">Points – low → high</option>
        </select>
      </div>

      <div className="category-container">
        <div className="category-header">
          <Link to="/" className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <h1>{decodeURIComponent(category)} Books</h1>
        </div>

        {displayList.length === 0 ? (
          <p className="no-books">No books match your filters.</p>
        ) : (
          <div className="category-books">
            {displayList.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-image-container">
                  <Link to={`/books/${book.id}`}>
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

                <div className="book-info">
                  <Link to={`/books/${book.id}`} className="book-title">
                    <h3>{book.title}</h3>
                  </Link>
                  <p className="author">By {book.author}</p>
                  {book.discountPercentage > 0 ? (
                    <p className="price">
                      <span style={{ textDecoration: 'line-through', color: '#888' }}>
                        ${book.price?.toFixed(2)}
                      </span>
                      <span style={{ color: '#d32f2f', marginLeft: 8 }}>
                        ${book.discountedPrice?.toFixed(2)}
                      </span>
                      <br />
                      <span style={{ color: '#388e3c' }}>
                        Discount: {book.discountPercentage}%
                      </span>
                    </p>
                  ) : (
                    <p className="price">${book.price?.toFixed(2)}</p>
                  )}
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
        )}
      </div>
    </div>
  );
}
