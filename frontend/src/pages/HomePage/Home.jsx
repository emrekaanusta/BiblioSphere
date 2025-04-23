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

  const BookCard = ({ book }) => {
    const { addToCart } = useCart();
    const { isBookFavorite, updateFavorites } = useFavorites();
    const navigate = useNavigate();

    const handleAddToCart = () => {
      addToCart(book);
      setIsCartOpen(true);
    };

    const handleToggleFavorite = () => {
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
          <p className="price">${book.price?.toFixed(2)}</p>
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
            <h3>Non-Fiction</h3>
            <Link to="/category/non-fiction" className="btn">Explore</Link>
          </div>
          <div className="category-card">
            <h3>Science</h3>
            <Link to="/category/science" className="btn">Explore</Link>
          </div>
          <div className="category-card">
            <h3>Romance</h3>
            <Link to="/category/romance" className="btn">Explore</Link>
          </div>
        </div>
      </section>

      <div className="deal-container">
        <section className="deal">
          <div className="content">
            <h3>Special Sale</h3>
            <h1>up to 50% off</h1>
            <p>Discover amazing deals on our best-selling books!</p>
            <Link to="/products" className="btn">Shop Now</Link>
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
