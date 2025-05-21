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
  const [categories, setCategories] = useState([]); // fetched from backend

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
        await fetch("http://localhost:8080/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
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
  const handleFavoritesClick = (e) => { e.preventDefault(); toggleFavorites(); };
  const handleAuthOption = (path) => {
    setShowAuthDropdown(false);
    navigate(path);
  };

  /* ------------------------ fetch categories ---------------------- */
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/categories")
      .then(res => {
        // res.data is [{ id, name }, …]
        setCategories(res.data.map(c => c.name));
      })
      .catch(err => {
        console.error("Failed to load nav categories:", err);
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
            </button>
            {showCategoriesDropdown && (
              <div className="categories-dropdown">
                {categories.map(name => (
                  <button
                    key={name}
                    className="category-item"
                    onClick={() => handleCategoryClick(name)}
                  >
                    {/* you can swap icons per category if desired */}
                    <i className="fas fa-book"></i>  
                    {name}
                  </button>
                ))}
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
                    <button onClick={() => handleAuthOption("/orders")}>
                      <i className="fas fa-box"></i> Orders
                    </button>
                    <button onClick={handleSignOut}>
                      <i className="fas fa-sign-out-alt"></i> Sign Out
                    </button>
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
