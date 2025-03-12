import React from 'react';
import { Link } from 'react-router-dom';
import '../homepage.css';

const Homepage = () => {
    return (
        <>
            {/* Header Section */}
            <header className="header">
                <section className="header-1">
                    <a href="#" className="logo">
                        <i className="fas fa-book"></i>BiblioSphere
                    </a>
                    <form action="" className="search-form">
                        <input type="search" placeholder="search here..." id="search-box" />
                        <label htmlFor="search-box" className="fas fa-search"></label>
                    </form>
                    <div className="icons">
                        <div id="search-btn" className="fas fa-search"></div>
                        <a href="#" className="fas fa-heart"></a>
                        <a href="#" className="fas fa-shopping-cart"></a>
                        <div id="login-btn" className="fas fa-user"></div>
                    </div>
                </section>

                {/* Navigation bar */}
                <div className="header-2">
                    <nav className="navbar">
                        <a href="#home">home</a>
                        <a href="#featured">featured</a>
                    </nav>
                </div>
            </header>

            {/* Bottom Navbar */}
            <nav className="bottom-navbar">
                <a href="#home" className="fas fa-home"></a>
                <a href="#featured" className="fas fa-list"></a>
            </nav>

            {/* Login Form */}
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
                        don't have an account ? <a href="#">create one</a>
                    </p>
                </form>
            </div>

            {/* Home Section */}
            <div className="home-container">
                <section className="home" id="home">
                    <div className="row">
                        <div className="content">
                            <h3>Up to 75% off</h3>
                            <p>
                                Start your reading journey with Chuck Palahniuk!
                            </p>
                            {/* Navigate to Product Page */}
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
                        {/* Book Card 1 */}
                        <div className="swiper-slide">
                            <div className="book-card">
                                <div className="image">
                                    <img src="/images/book1.jpg" alt="Featured Book 1" />
                                </div>
                                <div className="content">
                                    <h3>Book Title 1</h3>
                                    <div className="price">
                                        $15.99 <span>$20.99</span>
                                    </div>
                                    <div className="stars">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star-half-alt"></i>
                                    </div>
                                    <a href="#" className="btn">Add to Cart</a>
                                </div>
                            </div>
                        </div>

                        {/* Book Card 2 */}
                        <div className="swiper-slide">
                            <div className="book-card">
                                <div className="image">
                                    <img src="/images/book2.jpg" alt="Featured Book 2" />
                                </div>
                                <div className="content">
                                    <h3>Book Title 2</h3>
                                    <div className="price">
                                        $12.99 <span>$18.99</span>
                                    </div>
                                    <div className="stars">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star-half-alt"></i>
                                        <i className="far fa-star"></i>
                                    </div>
                                    <a href="#" className="btn">Add to Cart</a>
                                </div>
                            </div>
                        </div>

                        {/* Additional featured books */}
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
                            <p>
                                One of the greatest books I have read so far.
                            </p>
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
        </>
    );
};

export default Homepage;
