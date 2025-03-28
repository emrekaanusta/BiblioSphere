import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import './CategoryPage.css';

const CategoryPage = () => {
    const { category } = useParams();
    const { addToCart } = useCart();
    const { addToFavorites, removeFromFavorites, isBookFavorite } = useFavorites();

    // This would typically come from an API or context
    const books = [
        {
            id: 1,
            title: 'Fight Club',
            author: 'Chuck Palahniuk',
            type: 'Fiction',
            price: 19.99,
            image: '/images/book1.jpg',
            description: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
            publishYear: '1996',
            isbn: '978-0393039764',
            pages: 208,
            language: 'English',
            publisher: 'W. W. Norton & Company'
        },
        {
            id: 2,
            title: 'Snuff',
            author: 'Chuck Palahniuk',
            type: 'Drama',
            price: 29.99,
            image: '/images/book2.jpg',
            description: 'A novel about the adult film industry, following the story of aging porn queen Cassie Wright, who intends to cap her career by breaking the world record for serial fornication.',
            publishYear: '2008',
            isbn: '978-0385517881',
            pages: 197,
            language: 'English',
            publisher: 'Doubleday'
        },
        {
            id: 3,
            title: 'Invisible Monsters',
            author: 'Chuck Palahniuk',
            type: 'Fiction',
            price: 15.99,
            image: '/images/book3.jpg',
            description: 'A novel about a fashion model who has everything: a boyfriend, a career, a loyal best friend. But one day she has an accident on a highway and becomes a monster.',
            publishYear: '1999',
            isbn: '978-0393319293',
            pages: 297,
            language: 'English',
            publisher: 'W. W. Norton & Company'
        },
        {
            id: 4,
            title: 'Choke',
            author: 'Chuck Palahniuk',
            type: 'Mystery',
            price: 24.99,
            image: '/images/book4.jpg',
            description: 'Victor Mancini, a medical-school dropout, is an antihero for our deranged times. Needing to pay elder care for his mother, Victor has devised an ingenious scam.',
            publishYear: '2001',
            isbn: '978-0385720922',
            pages: 293,
            language: 'English',
            publisher: 'Doubleday'
        }
    ];

    const categoryBooks = books.filter(book => book.type.toLowerCase() === category.toLowerCase());

    const handleAddToCart = (book) => {
        addToCart(book);
    };

    const handleToggleFavorite = (book) => {
        if (isBookFavorite(book.id)) {
            removeFromFavorites(book.id);
        } else {
            addToFavorites(book);
        }
    };

    return (
        <div className="category-page">
            <header className="header">
                <section className="header-1">
                    <Link to="/" className="logo">
                        <i className="fas fa-book"></i> BiblioSphere
                    </Link>
                    <div className="icons">
                        <Link to="/favorites" className="fas fa-heart"></Link>
                        <Link to="/cart" className="fas fa-shopping-cart"></Link>
                        <Link to="/profile" className="fas fa-user"></Link>
                    </div>
                </section>
            </header>

            <div className="category-container">
                <div className="category-header">
                    <Link to="/" className="back-button">
                        <i className="fas fa-arrow-left"></i> Back to Home
                    </Link>
                    <h1>{category} Books</h1>
                </div>

                <div className="category-books">
                    {categoryBooks.map(book => (
                        <div key={book.id} className="book-card">
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
                            <div className="book-info">
                                <Link to={`/book/${book.id}`} className="book-title">
                                    <h3>{book.title}</h3>
                                </Link>
                                <p className="author">by {book.author}</p>
                                <p className="price">${book.price.toFixed(2)}</p>
                                <button 
                                    onClick={() => handleAddToCart(book)}
                                    className="add-to-cart-btn"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage; 