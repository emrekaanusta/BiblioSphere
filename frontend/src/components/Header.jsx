import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import './Header.css';

const Header = () => {
  const { toggleCart, cart } = useCart();
  const { toggleFavorites, favorites } = useFavorites();
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const navigate = useNavigate();

  const cartItemCount = cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
  const favoritesCount = favorites ? favorites.length : 0;

  const handleCartClick = (e) => {
    e.preventDefault();
    toggleCart();
  };

  const handleFavoritesClick = (e) => {
    e.preventDefault();
    toggleFavorites();
  };

  const handleAuthClick = () => {
    setShowAuthDropdown(!showAuthDropdown);
  };

  const handleAuthOption = (path) => {
    setShowAuthDropdown(false);
    navigate(path);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.auth-container')) {
        setShowAuthDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">BiblioSphere</Link>
        </div>
        
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Books</Link>
        </nav>

        <div className="header-actions">
          <div className="auth-container">
            <button className="icon-button" onClick={handleAuthClick}>
              <i className="fas fa-user"></i>
            </button>
            {showAuthDropdown && (
              <div className="auth-dropdown">
                <button onClick={() => handleAuthOption('/login')}>
                  <i className="fas fa-sign-in-alt"></i>
                  Login
                </button>
                <button onClick={() => handleAuthOption('/register')}>
                  <i className="fas fa-user-plus"></i>
                  Register
                </button>
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