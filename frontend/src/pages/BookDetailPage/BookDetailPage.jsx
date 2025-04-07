import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import './BookDetailPage.css';

const BookDetailPage = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToFavorites, removeFromFavorites, isBookFavorite } = useFavorites();

    // This would typically come from an API or context
    // For now, we'll use the same data structure as in ProductPage
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

    const book = books.find(b => b.id === parseInt(bookId)) || books[0];

    const handleAddToCart = () => {
        addToCart(book);
    };

    const handleToggleFavorite = () => {
        if (isBookFavorite(book.id)) {
            removeFromFavorites(book.id);
        } else {
            addToFavorites(book);
        }
    };

    return (
        <div className="book-detail-page">
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

            <div className="book-detail-container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left"></i>
                </button>
                <div className="book-image-section">
                    <img src={book.image} alt={book.title} className="book-cover" />
                    <div className="book-actions">
                        <button 
                            className="add-to-cart-btn"
                            onClick={handleAddToCart}
                        >
                            Add to Cart - ${book.price}
                        </button>
                        <button
                            className={`favorite-btn ${isBookFavorite(book.id) ? 'active' : ''}`}
                            onClick={handleToggleFavorite}
                        >
                            <i className="fas fa-heart"></i>
                        </button>
                    </div>
                </div>

                <div className="book-info-section">
                    <h1>{book.title}</h1>
                    <h2>by {book.author}</h2>
                    <div className="book-meta">
                        <span><i className="fas fa-bookmark"></i> {book.type}</span>
                        <span><i className="fas fa-calendar"></i> {book.publishYear}</span>
                        <span><i className="fas fa-language"></i> {book.language}</span>
                    </div>
                    
                    <div className="book-description">
                        <h3>About this book</h3>
                        <p>{book.description}</p>
                    </div>

                    <div className="book-details">
                        <h3>Product Details</h3>
                        <table>
                            <tbody>
                                <tr>
                                    <td>ISBN:</td>
                                    <td>{book.isbn}</td>
                                </tr>
                                <tr>
                                    <td>Publisher:</td>
                                    <td>{book.publisher}</td>
                                </tr>
                                <tr>
                                    <td>Publication Year:</td>
                                    <td>{book.publishYear}</td>
                                </tr>
                                <tr>
                                    <td>Pages:</td>
                                    <td>{book.pages}</td>
                                </tr>
                                <tr>
                                    <td>Language:</td>
                                    <td>{book.language}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailPage; 