import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './productpage.css';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import ShoppingCart from '../../components/ShoppingCart';

const ProductPage = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { addToCart } = useCart();
    const { isBookFavorite, updateFavorites } = useFavorites();
    const navigate = useNavigate();

    const [books] = useState([
        { id: 1, title: 'Fight Club', author: 'Chuck Palahniuk', type: 'Fiction', price: 19.99, image: '/images/book1.jpg' },
        { id: 2, title: 'Snuff', author: 'Chuck Palahniuk', type: 'Dram', price: 29.99, image: '/images/book2.jpg' },
        { id: 3, title: 'Invisible Monsters', author: 'Chuck Palahniuk', type: 'Fiction', price: 15.99, image: '/images/book3.jpg' },
        { id: 4, title: 'Choke', author: 'Chuck Palahniuk', type: 'Mystery', price: 24.99, image: '/images/book4.jpg' },
    ]);

    const handleAddToCart = (book) => {
        addToCart(book);
        setIsCartOpen(true);
    };

    const handleToggleFavorite = (book) => {
        const token = localStorage.getItem("token");
        if (!token) {
          // User not logged in, so redirect to the login page.
          navigate("/login");
          return;
        }
      
        // Determine the endpoint based on whether the book is already favorited
        const endpoint = isBookFavorite(book.id) ? "remove" : "add";
      
        fetch(`http://localhost:8080/favorites/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: book.id.toString() }),
        })
          .then((response) => {
            
            if (!response.ok) {
              throw new Error(`Error ${endpoint === "add" ? "adding" : "removing"} product from wishlist`);
            }
            return response.json();
          })
          .then((updatedFavorites) => {
            updateFavorites(updatedFavorites);
          })
          .catch((error) => {
            console.error(error);
          });
      };
      

    return (
        <>
            <div className="product-page">
                <h1>All Books</h1>
                {/* Search Bar */}
                <div className="search-bar">
                    <input type="text" placeholder="Search by title or author..." />
                    <button className="search-btn">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
                {/* Filter and Sort Controls */}
                <div className="filters">
                    {/* Add filter controls if needed */}
                </div>
                {/* Book List */}
                <div className="book-list">
                    {books.map((book) => (
                        <div className="book-item" key={book.id}>
                            <div className="book-image-container">
                                <Link to={`/book/${book.id}`}>
                                    <img src={book.image} alt={book.title} className="book-image" />
                                </Link>
                                <button
                                    className={`favorite-btn ${isBookFavorite(book.id) ? 'active' : ''}`}
                                    onClick={() => handleToggleFavorite(book)}
                                >
                                    <i className="fas fa-heart"></i>
                                </button>
                            </div>
                            <Link to={`/book/${book.id}`} className="book-title">
                                <h3>{book.title}</h3>
                            </Link>
                            <p>Author: {book.author}</p>
                            <p>Type: {book.type}</p>
                            <p className="price">Price: ${book.price.toFixed(2)}</p>
                            <button className="btn" onClick={() => handleAddToCart(book)}>
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
};

export default ProductPage;
