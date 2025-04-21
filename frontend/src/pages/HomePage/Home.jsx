import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './homepage.css';
import ShoppingCart from '../../components/ShoppingCart';
import Favorites from '../../components/Favorites';
import ProfileDropdown from '../../components/ProfileDropdown';
import StarRating from '../../components/StarRating';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import axios from 'axios';

import SwiperCore, { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

SwiperCore.use([Navigation]);

const Homepage = () => {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [featuredBooks, setFeaturedBooks] = useState([]);

  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isBookFavorite } = useFavorites();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }

    axios
      .get('http://localhost:8080/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('Books fetched from backend:', response.data);
        const dataWithIds = response.data.map((item) => ({
          ...item,
          id: item.isbn || item._id,
        }));
        setFeaturedBooks(dataWithIds);
      })
      .catch((error) => {
        console.error('Error fetching featured books:', error);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToCart = (book) => {
    addToCart(book);
    setIsCartOpen(true);
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
      <nav className="bottom-navbar">
        <a href="#home" className="fas fa-home"></a>
        <a href="#featured" className="fas fa-list"></a>
      </nav>

      {!isLoggedIn && (
        <div className="login-form-container">
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
            <p>forget password ? <a href="#">click here</a></p>
            <p>don't have an account ? <Link to="/register">create one</Link></p>
          </form>
        </div>
      )}

      <div className="home-container">
        <section className="home" id="home">
          <div className="row">
            <div className="content">
              <h3>Up to 75% off</h3>
              <p>Start your reading journey with Chuck Palahniuk!</p>
              <Link to="/products" className="btn">View All Books</Link>
            </div>
            <div className="swiper books-slider">
              <div className="swiper-wrapper">
                <a href="#" className="swiper-slide"><img src="/images/book1.jpg" alt="Book 1" /></a>
                <a href="#" className="swiper-slide"><img src="/images/book2.jpg" alt="Book 2" /></a>
                <a href="#" className="swiper-slide"><img src="/images/book3.jpg" alt="Book 3" /></a>
              </div>
              <img src="/images/stand.png" className="stand" alt="Stand" />
            </div>
          </div>
        </section>
      </div>

      <section className="featured" id="featured">
        <h1 className="heading"><span>Featured Books</span></h1>
        <Swiper
          modules={[Navigation]}
          spaceBetween={30}
          slidesPerView={3}
          navigation
          loop
          className="featured-slider"
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {featuredBooks.map((book) => (
            <SwiperSlide key={book.id}>
              <div className="book-card">
                <div className="image">
                  <Link to={`/books/${book.id}`}>
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
                  <Link to={`/books/${book.id}`} className="book-title">
                    <h3>{book.title}</h3>
                  </Link>
                  <div className="price">${book.price?.toFixed(2)}</div>
                  <StarRating rating={book.rating || 0} />
                  <button onClick={() => handleAddToCart(book)} className="btn">Add to Cart</button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <div className="newsletter-container">
        <section className="newsletter">
          <form action="">
            <h3>subscribe for latest updates</h3>
            <input type="email" placeholder="enter your email" className="box" />
            <input type="submit" value="subscribe" className="btn" />
          </form>
        </section>
      </div>

      <div className="deal-container">
        <section className="deal">
          <div className="content">
            <h3>deal of the day</h3>
            <h1>up to 50% off</h1>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit...</p>
            <a href="#" className="btn">shop now</a>
          </div>
          <div className="image">
            <img src="/images/deal-img.jpg" alt="Deal" />
          </div>
        </section>
      </div>

      <section className="footer">
        <div className="box-container">
          <h3>Contact Us</h3>
          <a href="tel:08504567890"><i className="fas fa-phone"></i> 0850 456 7890</a>
          <a href="mailto:info@biblioSphere.com"><i className="fas fa-envelope"></i> info@biblioSphere.com</a>
        </div>
      </section>

      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Favorites isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />
    </>
  );
};

export default Homepage;
