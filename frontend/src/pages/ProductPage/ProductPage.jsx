import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './productpage.css';
import { useCart } from '../../contexts/CartContext';
import ShoppingCart from '../../components/ShoppingCart';

const ProductPage = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { addToCart } = useCart();
    const [books] = useState([
        { id: 1, title: 'Fight Club', author: 'Chuck Palahniuk', type: 'Fiction', price: 19.99, image: '/images/book1.jpg' },
        { id: 2, title: 'Snuff', author: 'Chuck Palahniuk', type: 'Dram', price: 29.99, image: '/images/book2.jpg' },
        { id: 3, title: 'Invisible Monsters', author: 'Chuck Palahniuk', type: 'Fiction', price: 15.99, image: '/images/book3.jpg' },
        { id: 4, title: 'Choke', author: 'Chuck Palahniuk', type: 'Mystery', price: 24.99, image: '/images/book4.jpg' },
    ]);

    // States for filtering, sorting, and search.
    const [selectedType, setSelectedType] = useState('');
    const [sortOrder, setSortOrder] = useState(''); // 'asc' or 'desc'
    const [searchQuery, setSearchQuery] = useState('');

    // Filter books by type and search query.
    let filteredBooks = books.filter((book) => {
        const matchesType = selectedType === '' || book.type === selectedType;
        const matchesSearch =
            searchQuery === '' ||
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    // Sort the filtered books by price.
    if (sortOrder === 'asc') {
        filteredBooks = filteredBooks.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
        filteredBooks = filteredBooks.sort((a, b) => b.price - a.price);
    }

    // Get unique types for the type filter.
    const types = [...new Set(books.map((book) => book.type))];

    const handleAddToCart = (book) => {
        addToCart(book);
        // Optional: Show a confirmation message or open the cart
        setIsCartOpen(true);
    };

    return (
        <>
            {/* Header Section (same as Homepage) */}
            <header className="header">
                <section className="header-1">
                    <Link to="/" className="logo">
                        <i className="fas fa-book"></i> BiblioSphere
                    </Link>
                    <form action="" className="search-form">
                        <input type="search" placeholder="search here..." id="search-box" />
                        <label htmlFor="search-box" className="fas fa-search"></label>
                    </form>
                    <div className="icons">
                        <div id="search-btn" className="fas fa-search"></div>
                        <Link to="/favorites" className="fas fa-heart"></Link>
                        <div 
                            className="fas fa-shopping-cart"
                            onClick={() => setIsCartOpen(true)}
                        ></div>
                        <div id="login-btn" className="fas fa-user"></div>
                    </div>
                </section>
                <div className="header-2">
                    <nav className="navbar">
                        <Link to="/">home</Link>
                    </nav>
                </div>
            </header>

            {/* Product Page Content */}
            <div className="product-page">
                <h1>All Books</h1>

                {/* Search Bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="search-btn">
                        <i className="fas fa-search"></i>
                    </button>
                </div>

                {/* Filter and Sort Controls */}
                <div className="filters">
                    <label>
                        Filter by Type:
                        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                            <option value="">All</option>
                            {types.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Sort by Price:
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="">None</option>
                            <option value="asc">Low to High</option>
                            <option value="desc">High to Low</option>
                        </select>
                    </label>
                </div>

                {/* Book List */}
                <div className="book-list">
                    {filteredBooks.map((book) => (
                        <div className="book-item" key={book.id}>
                            <img src={book.image} alt={book.title} className="book-image" />
                            <h3>{book.title}</h3>
                            <p>Author: {book.author}</p>
                            <p>Type: {book.type}</p>
                            <p className="price">Price: ${book.price.toFixed(2)}</p>
                            <button 
                                className="btn"
                                onClick={() => handleAddToCart(book)}
                            >
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
