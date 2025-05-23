// frontend/src/components/Header.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import axios from "axios";
import "./Header.css";

const Header = () => {
  const { toggleCart, cart, clearCart } = useCart();
  const { toggleFavorites, favorites, clearFavorites } = useFavorites();

  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  const navigate = useNavigate();

  /* -------------------------- auth state -------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    setIsLoggedIn(!!token);
    if (userEmail) {
      setUsername(userEmail.split("@")[0]);
    }
  }, []);

  const handleSignOut = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("http://localhost:8080/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
    clearFavorites();
    clearCart();
    setShowAuthDropdown(false);
    navigate("/");
  };

  const handleAuthClick = () => setShowAuthDropdown(!showAuthDropdown);
  const handleCartClick = (e) => { e.preventDefault(); toggleCart(); };
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

  const isProductManager = localStorage.getItem('isPM') === 'true';

  /* ------------------------ fetch categories ---------------------- */
  useEffect(() => {
    setIsLoadingCategories(true);
    setCategoriesError(null);
    axios
      .get("http://localhost:8080/api/categories")
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setCategories(res.data.map(c => c.name));
        } else {
          console.error("Invalid categories response format:", res.data);
          setCategoriesError("Invalid response format from server");
        }
        setIsLoadingCategories(false);
      })
      .catch(err => {
        console.error("Failed to load nav categories:", err);
        if (err.response) {
          console.error("Error response:", err.response.data);
          setCategoriesError(`Server error: ${err.response.status}`);
        } else if (err.request) {
          console.error("No response received:", err.request);
          setCategoriesError("No response from server");
        } else {
          setCategoriesError("Failed to load categories. Please try again later.");
        }
        setIsLoadingCategories(false);
      });
  }, []);

  const handleCategoryClick = (cat) => {
    setShowCategoriesDropdown(false);
    navigate(`/category/${cat.toLowerCase()}`);
  };

  /* ------------------------ counts ------------------------------- */
  const cartItemCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const favoritesCount = favorites?.length || 0;

  /* ----------------- close dropdowns on outside click ----------- */
  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest(".auth-container"))       setShowAuthDropdown(false);
      if (!e.target.closest(".categories-container")) setShowCategoriesDropdown(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  /* ------------------------------ UI ----------------------------- */
  return (
    <header className="header">
      <div className="header-content">
        {/* Logo */}
        <div className="logo">
          <Link to="/">BiblioSphere</Link>
        </div>

        {/* Nav links */}
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Books</Link>

          {/* Categories dropdown */}
          <div className="categories-container">
            <button
              className="nav-link categories-button"
              onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
            >
              Categories
              <i className="fas fa-chevron-down"></i>
            </button>
            {showCategoriesDropdown && (
              <div className="categories-dropdown">
                {isLoadingCategories ? (
                  <div className="category-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    Loading categories...
                  </div>
                ) : categoriesError ? (
                  <div className="category-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {categoriesError}
                  </div>
                ) : categories.length === 0 ? (
                  <div className="category-empty">
                    <i className="fas fa-info-circle"></i>
                    No categories available
                  </div>
                ) : (
                  categories.map(name => (
                    <button
                      key={name}
                      className="category-item"
                      onClick={() => handleCategoryClick(name)}
                    >
                      <i className="fas fa-book"></i>
                      {name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Right-hand icons */}
        <div className="header-actions">
          {/* User / Auth */}
          <div className="auth-container">
            <button className="icon-button" onClick={handleAuthClick}>
              <i className="fas fa-user"></i>
              {isLoggedIn && <span className="user-email">{username}</span>}
            </button>
            {showAuthDropdown && (
              <div className="auth-dropdown">
                {isLoggedIn ? (
                  <>
                    {isProductManager ? (
                      <>
                        <button onClick={() => handleAuthOption("/pm/pcontrol")}>
                          <i className="fas fa-box"></i> Products
                        </button>
                        <button onClick={handleSignOut}>
                          <i className="fas fa-sign-out-alt"></i> Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleAuthOption("/profile")}>
                          <i className="fas fa-id-card"></i> Profile
                        </button>
                        <button onClick={() => handleAuthOption("/orders")}>
                          <i className="fas fa-box"></i> Orders
                        </button>
                        <button onClick={handleSignOut}>
                          <i className="fas fa-sign-out-alt"></i> Sign Out
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={() => handleAuthOption("/login")}>
                      <i className="fas fa-sign-in-alt"></i> Login
                    </button>
                    <button onClick={() => handleAuthOption("/register")}>
                      <i className="fas fa-user-plus"></i> Register
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Favorites */}
          <button className="icon-button" onClick={handleFavoritesClick} aria-label="Favorites">
            <i className="fas fa-heart"></i>
            {favoritesCount > 0 && <span className="count-badge">{favoritesCount}</span>}
          </button>

          {/* Cart */}
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
