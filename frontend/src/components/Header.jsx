import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import "./Header.css";

const Header = () => {
  const { toggleCart, cart, clearCart } = useCart();
  const { toggleFavorites, favorites, clearFavorites } = useFavorites();

  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  const navigate = useNavigate();

  /* -------------------------- auth state -------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    setIsLoggedIn(!!token);
    if (userEmail) {
      setUsername(userEmail.split('@')[0]);
    }
  }, []);

  const handleSignOut = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("http://localhost:8080/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        // Accept 200 or 403 or empty response as valid for logout
        if (!response.ok && response.status !== 403) {
          const text = await response.text();
          console.error("Logout failed:", text);
        }
      } catch (error) {
        // Suppress error
      }
    }
    // Clear local storage and state regardless of API call success
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    clearFavorites();                 // wipe client‑side data
    clearCart();                      // clear the cart when logging out
    setShowAuthDropdown(false);
    navigate("/");
  };

  const handleAuthClick   = () => setShowAuthDropdown(!showAuthDropdown);
  const handleCartClick   = (e) => { e.preventDefault(); toggleCart(); };
  const handleFavoritesClick = (e) => { 
    e.preventDefault(); 
    if (!isLoggedIn) {
      alert('Please log in to view your favorites');
      navigate('/login');
      return;
    }
    toggleFavorites(); 
  };

  const handleAuthOption = (path) => {
    setShowAuthDropdown(false);
    navigate(path);
  };

  /* ------------------------ categories --------------------------- */
  const handleCategoryClick = (category) => {
    setShowCategoriesDropdown(false);
    navigate(`/category/${category.toLowerCase()}`);
  };

  const categories = [
    { name: "Fiction",          icon: "fas fa-book" },
    { name: "Drama",            icon: "fas fa-theater-masks" },
    { name: "Mystery",          icon: "fas fa-search" },
    { name: "Romance",          icon: "fas fa-heart" },
    { name: "Science Fiction",  icon: "fas fa-rocket" },
    { name: "Fantasy",          icon: "fas fa-dragon" },
  ];

  /* ------------------------ counts ------------------------------- */
  const cartItemCount     = cart ? cart.reduce((t, i) => t + i.quantity, 0) : 0;
  const favoritesCount    = favorites ? favorites.length : 0;

  /* ----------------- close dropdowns on outside click ----------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".auth-container"))       setShowAuthDropdown(false);
      if (!e.target.closest(".categories-container")) setShowCategoriesDropdown(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /* ------------------------------ UI ----------------------------- */
  return (
    <header className="header">
      <div className="header-content">
        {/* logo */}
        <div className="logo">
          <Link to="/">BiblioSphere</Link>
        </div>

        {/* nav links */}
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
                {categories.map((c) => (
                  <button
                    key={c.name}
                    className="category-item"
                    onClick={() => handleCategoryClick(c.name)}
                  >
                    <i className={c.icon}></i>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* right‑hand icons */}
        <div className="header-actions">
          {/* user / auth */}
          <div className="auth-container">
            <button className="icon-button" onClick={handleAuthClick}>
              <i className="fas fa-user"></i>
              {isLoggedIn && username && <span className="user-email">{username}</span>}
            </button>

            {showAuthDropdown && (
              <div className="auth-dropdown">
                {isLoggedIn ? (
                  <>
                    {/* NEW Orders link (signed‑in only) */}
                    <button onClick={() => handleAuthOption("/orders")}>
                      <i className="fas fa-box"></i>
                      Orders
                    </button>

                    <button onClick={handleSignOut}>
                      <i className="fas fa-sign-out-alt"></i>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleAuthOption("/login")}>
                      <i className="fas fa-sign-in-alt"></i>
                      Login
                    </button>
                    <button onClick={() => handleAuthOption("/register")}>
                      <i className="fas fa-user-plus"></i>
                      Register
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* favorites */}
          <button className="icon-button" onClick={handleFavoritesClick} aria-label="Favorites">
            <i className="fas fa-heart"></i>
            {favoritesCount > 0 && <span className="count-badge">{favoritesCount}</span>}
          </button>

          {/* cart */}
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
