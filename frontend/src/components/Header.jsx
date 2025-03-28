import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import './Header.css';

const Header = () => {
  const { toggleCart, cart } = useCart();
  // Destructure favorites + clearFavorites from your context
  const { toggleFavorites, favorites, clearFavorites } = useFavorites();

  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token in Header:", token);
    setIsLoggedIn(!!token);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Call the context method to clear favorites
    clearFavorites();
    setShowAuthDropdown(false);
    navigate('/');
  };

  const handleAuthClick = () => {
    setShowAuthDropdown(!showAuthDropdown);
  };

  const handleAuthOption = (path) => {
    setShowAuthDropdown(false);
    navigate(path);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    toggleCart();
  };

  const handleFavoritesClick = (e) => {
    e.preventDefault();
    toggleFavorites();
  };

  const handleCategoryClick = (category) => {
    setShowCategoriesDropdown(false);
    navigate(`/category/${category.toLowerCase()}`);
  };

  const cartItemCount = cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
  const favoritesCount = favorites ? favorites.length : 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.auth-container')) {
        setShowAuthDropdown(false);
      }
      if (!event.target.closest('.categories-container')) {
        setShowCategoriesDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const categories = [
    { name: 'Fiction', icon: 'fas fa-book' },
    { name: 'Drama', icon: 'fas fa-theater-masks' },
    { name: 'Mystery', icon: 'fas fa-search' },
    { name: 'Romance', icon: 'fas fa-heart' },
    { name: 'Science Fiction', icon: 'fas fa-rocket' },
    { name: 'Fantasy', icon: 'fas fa-dragon' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">BiblioSphere</Link>
        </div>
        
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Books</Link>
          <div className="categories-container">
            <button 
              className="nav-link categories-button"
              onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
            >
              Categories
            </button>
            {showCategoriesDropdown && (
              <div className="categories-dropdown">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="category-item"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <i className={category.icon}></i>
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="header-actions">
          <div className="auth-container">
            <button className="icon-button" onClick={handleAuthClick}>
              <i className="fas fa-user"></i>
            </button>
            {showAuthDropdown && (
              <div className="auth-dropdown">
                {isLoggedIn ? (
                  <button onClick={handleSignOut}>
                    <i className="fas fa-sign-out-alt"></i>
                    Sign Out
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleAuthOption('/login')}>
                      <i className="fas fa-sign-in-alt"></i>
                      Login
                    </button>
                    <button onClick={() => handleAuthOption('/register')}>
                      <i className="fas fa-user-plus"></i>
                      Register
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <button className="icon-button" onClick={handleFavoritesClick} aria-label="Favorites">
            <i className="fas fa-heart"></i>
            {favoritesCount > 0 && <span className="count-badge">{favoritesCount}</span>}
          </button>
          <button className="cart-button" onClick={handleCartClick} aria-label="Shopping Cart">
            <i className="fas fa-shopping-cart"></i>
            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
