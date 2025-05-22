import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './homepage.css';
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

  const { addToCart, toggleCart } = useCart();
  const { addToFavorites, removeFromFavorites, isBookFavorite } = useFavorites();

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
        const dataWithIds = response.data
          .filter(book => book.image && book.rating && book.stock > 0)
          .filter(book => book.price !== -1)
          .map((item) => ({
            ...item,
            id: item.isbn || item._id,
          }))
          .slice(0, 12);
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

  const BookCard = ({ book }) => {
    const { addToCart } = useCart();
    const { isBookFavorite, addToFavorites, removeFromFavorites } = useFavorites();
    const navigate = useNavigate();

    const handleAddToCart = () => {
      const success = addToCart(book);
      if (!success) {
        if (book.stock === 0) {
          alert('This item is out of stock.');
        } else {
          alert(`Cannot add more items. Only ${book.stock} available in stock.`);
        }
      }
    };

    const handleToggleFavorite = () => {
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

    return (
      <div className="book-card" key={book.id}>
        <div className="book-image-container">
          <Link to={`/books/${book.id}`} style={{ display: 'block', width: '100%' }}>
            <img src={book.image} alt={book.title} className="book-image" />
          </Link>
          <button
            className={`favorite-btn ${isBookFavorite(book.id) ? 'active' : ''}`}
            onClick={handleToggleFavorite}
          >
            <i className="fas fa-heart" />
          </button>
        </div>

        <div className="book-info">
          <Link to={`/books/${book.id}`} className="book-title">
            <h3>{book.title}</h3>
          </Link>
          <p className="author">By {book.author}</p>
          {book.discountPercentage > 0 ? (
            <p className="price">
              <span style={{ textDecoration: 'line-through', color: '#888' }}>${book.price?.toFixed(2)}</span>
              <span style={{ color: '#d32f2f', marginLeft: 8 }}>
                Discounted Price: ${book.discountedPrice?.toFixed(2)}
              </span>
              <br />
              <span style={{ color: '#388e3c' }}>Discount: {book.discountPercentage}%</span>
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
            onClick={handleAddToCart}
            disabled={book.stock === 0}
          >
            {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    );
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
              <p>Discover our featured collection!</p>
              <Link to="/products" className="btn">View All Books</Link>
            </div>
            <div className="swiper books-slider">
              <div className="swiper-wrapper">
                {featuredBooks.slice(0, 6)
                .filter(book => book.price !== -1)
                .map((book) => (
                  <Link to={`/books/${book.id}`} key={book.id} className="swiper-slide">
                    <img src={book.image} alt={book.title} />
                  </Link>
                ))}
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
          navigation={true}
          loop={true}
          className="featured-slider"
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 10 },
            576: { slidesPerView: 2, spaceBetween: 15 },
            768: { slidesPerView: 3, spaceBetween: 30 }
          }}
        >
          {featuredBooks
          .filter(book => book.price !== -1)
          .map((book) => (
            <SwiperSlide key={book.id}>
              <BookCard book={book} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="categories" id="categories">
        <h1 className="heading"><span>Book Categories</span></h1>
        <div className="categories-container">
          <div className="category-card">
            <h3>Fiction</h3>
            <Link to="/category/fiction" className="btn">Explore</Link>
          </div>
          <div className="category-card">
            <h3>Drama</h3>
            <Link to="/category/drama" className="btn">Explore</Link>
          </div>
          <div className="category-card">
            <h3>Mystery</h3>
            <Link to="/category/mystery" className="btn">Explore</Link>
          </div>
          <div className="category-card">
            <h3>Romance</h3>
            <Link to="/category/romance" className="btn">Explore</Link>
          </div>
          <div className="category-card">
            <h3>Science Fiction</h3>
            <Link to="/category/Science Fiction" className="btn">Explore</Link>
          </div>
          <div className="category-card">
            <h3>Fantasy</h3>
            <Link to="/category/fantasy" className="btn">Explore</Link>
          </div>
        </div>
      </section>

      <section className="footer">
        <div className="box-container">
          <h3>Contact Us</h3>
          <a href="tel:08504567890"><i className="fas fa-phone"></i> 0850 456 7890</a>
          <a href="mailto:info@biblioSphere.com"><i className="fas fa-envelope"></i> info@biblioSphere.com</a>
        </div>
      </section>

      <Favorites isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />
    </>
  );
};

export default Homepage;
