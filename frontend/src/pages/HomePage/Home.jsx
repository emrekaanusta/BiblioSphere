import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './homepage.css';
import ShoppingCart from '../../components/ShoppingCart';
import Favorites from '../../components/Favorites';
import ProfileDropdown from '../../components/ProfileDropdown';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';

const Homepage = () => {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Track whether the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check localStorage on mount to see if we have a token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Function to sign out
  const handleSignOut = () => {
    // Remove token from storage
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Optionally navigate somewhere
    navigate('/');
  };

  // Cart & favorites toggles
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isBookFavorite } = useFavorites();

  const featuredBooks = [
    { id: 1, title: 'Fight Club', author: 'Chuck Palahniuk', price: 15.99, image: '/images/book1.jpg' },
    { id: 2, title: 'Snuff', author: 'Chuck Palahniuk', price: 12.99, image: '/images/book2.jpg' },
    { id: 3, title: 'Invisible Monsters', author: 'Chuck Palahniuk', price: 14.99, image: '/images/book3.jpg' },
    { id: 4, title: 'Choke', author: 'Chuck Palahniuk', price: 13.99, image: '/images/book4.jpg' },
    { id: 5, title: 'Survivor', author: 'Chuck Palahniuk', price: 16.99, image: '/images/book5.jpg' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    setIsFavoritesOpen(false);
    setIsProfileOpen(false);
  };

  const toggleFavorites = () => {
    setIsFavoritesOpen(!isFavoritesOpen);
    setIsCartOpen(false);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsCartOpen(false);
    setIsFavoritesOpen(false);
  };

  const handleAddToCart = (book) => {
    addToCart(book);
    setIsCartOpen(true); // Show cart after adding item
  };

  const handleToggleFavorite = (book) => {
    if (isBookFavorite(book.id)) {
      removeFromFavorites(book.id);
    } else {
      addToFavorites(book);
    }
  };

  return (
    <>
      
      {/* Bottom Navbar */}
      <nav className="bottom-navbar">
        <a href="#home" className="fas fa-home"></a>
        <a href="#featured" className="fas fa-list"></a>
      </nav>

      {/* 
        Login Form Container 
        If user is already logged in, don't show the login form at all 
      */}
      {!isLoggedIn && (
        <div className="login-form-container">
          <div id="close-login-btn" className="fas fa-times"></div>
          <form action="">
            <h3>sign in</h3>
            <span>username</span>
            <input type="email" className="box" placeholder="enter your email" />
            <span>password</span>
            <input type="password" className="box" placeholder="enter your password" />
            <div className="checkbox">
              <input type="checkbox" id="remember-me" />
              <label htmlFor="remember-me"> remember me</label>
            </div>
            <input type="submit" value="sign in" className="btn" />
            <p>
              forget password ? <a href="#">click here</a>
            </p>
            <p>
              {/* If user not logged in, show register link */}
              don't have an account ? <Link to="/register">create one</Link>
            </p>
          </form>
        </div>
      )}

      {/* Home Section */}
      <div className="home-container">
        <section className="home" id="home">
          <div className="row">
            <div className="content">
              <h3>Up to 75% off</h3>
              <p>Start your reading journey with Chuck Palahniuk!</p>
              <Link to="/products" className="btn">
                View All Books
              </Link>
            </div>
            <div className="swiper books-slider">
              <div className="swiper-wrapper">
                <a href="#" className="swiper-slide">
                  <img src="/images/book1.jpg" alt="Book 1" />
                </a>
                <a href="#" className="swiper-slide">
                  <img src="/images/book2.jpg" alt="Book 2" />
                </a>
                <a href="#" className="swiper-slide">
                  <img src="/images/book3.jpg" alt="Book 3" />
                </a>
                <a href="#" className="swiper-slide">
                  <img src="/images/book4.jpg" alt="Book 4" />
                </a>
                <a href="#" className="swiper-slide">
                  <img src="/images/book5.jpg" alt="Book 5" />
                </a>
              </div>
              <img src="/images/stand.png" className="stand" alt="Stand" />
            </div>
          </div>
        </section>
      </div>

      {/* Icons Section */}
      <section className="icons-container">
        <div className="icons">
          <i className="fas fa-shipping-fast"></i>
          <div className="content">
            <h3>free shipping</h3>
            <p>order over $100</p>
          </div>
        </div>
        <div className="icons">
          <i className="fas fa-lock"></i>
          <div className="content">
            <h3>secure payment</h3>
            <p>100 secure payment</p>
          </div>
        </div>
        <div className="icons">
          <i className="fas fa-redo-alt"></i>
          <div className="content">
            <h3>easy returns</h3>
            <p>10 days returns</p>
          </div>
        </div>
        <div className="icons">
          <i className="fas fa-headset"></i>
          <div className="content">
            <h3>24/7 support</h3>
            <p>call us anytime</p>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="featured" id="featured">
        <h1 className="heading"><span>Featured Books</span></h1>
        <div className="swiper featured-slider">
          <div className="swiper-wrapper">
            {featuredBooks.map((book) => (
              <div key={book.id} className="swiper-slide">
                <div className="book-card">
                  <div className="image">
                    <Link to={`/book/${book.id}`}>
                      <img src={book.image} alt={book.title} />
                    </Link>
                    <button 
                      className={`favorite-btn ${isBookFavorite(book.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleFavorite(book);
                      }}
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                  </div>
                  <div className="content">
                    <Link to={`/book/${book.id}`} className="book-title">
                      <h3>{book.title}</h3>
                    </Link>
                    <div className="price">${book.price.toFixed(2)}</div>
                    <div className="stars">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star-half-alt"></i>
                    </div>
                    <button onClick={() => handleAddToCart(book)} className="btn">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="swiper-button-next"></div>
          <div className="swiper-button-prev"></div>
        </div>
      </section>

      {/* Newsletter Section */}
      <div className="newsletter-container">
        <section className="newsletter">
          <form action="">
            <h3>subscribe for latest updates</h3>
            <input type="email" placeholder="enter your email" className="box" />
            <input type="submit" value="subscribe" className="btn" />
          </form>
        </section>
      </div>

      {/* Deal Section */}
      <div className="deal-container">
        <section className="deal">
          <div className="content">
            <h3>deal of the day</h3>
            <h1>up to 50% off</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Unde perspiciatis in atque dolore tempora quaerat at
              fuga dolorum natus velit.
            </p>
            <a href="#" className="btn">shop now</a>
          </div>
          <div className="image">
            <img src="/images/deal-img.jpg" alt="Deal Image" />
          </div>
        </section>
      </div>

      {/* Reviews Section */}
      <section className="reviews" id="reviews">
        <h1 className="heading"><span>Highest Rated Books</span></h1>
        <div className="swiper reviews-slider">
          <div className="swiper-wrapper">
            <div className="swiper-slide box">
              <div className="book-container">
                <img
                  src="/images/book2.jpg"
                  alt="Book Cover"
                  className="book-image"
                />
                <div className="rating-overlay">
                  <div className="stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                  </div>
                </div>
              </div>
              <h3>john deo</h3>
              <p>One of the greatest books I have read so far.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="footer">
        <div className="box-container">
          <h3>Contact Us</h3>
          <a href="tel:08504567890">
            <i className="fas fa-phone"></i> 0850 456 7890
          </a>
          <a href="mailto:info@biblioSphere.com">
            <i className="fas fa-envelope"></i> info@biblioSphere.com
          </a>
        </div>
      </section>

      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Favorites isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />
    </>
  );
};

export default Homepage;
