import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import '../homepage.css';


export default function HomePage() {
    return (
        <div className="homepage-container">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">📚 BiblioSphere </div>
                <input type="text" placeholder="Search here..." className="search-bar" />
                <div className="nav-icons">
                    <span>❤️</span>
                    <span>🛒</span>
                    <span>👤</span>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-text">
                    <h1>Up to 75% Off</h1>
                    <p>Start your reading journey with Chuck Palahniuk!</p>
                    <button className="cta-button">Shop Now</button>
                </div>

                <div className="book-slider">
                    <Swiper
                        navigation={true}
                        modules={[Navigation]}
                        slidesPerView={4}
                        spaceBetween={20}
                        className="mySwiper"
                    >
                        <SwiperSlide><img src="/images/book1.jpg" alt="Book 1" /></SwiperSlide>
                        <SwiperSlide><img src="/images/book2.jpg" alt="Book 2" /></SwiperSlide>
                        <SwiperSlide><img src="/images/book3.jpg" alt="Book 3" /></SwiperSlide>
                        <SwiperSlide><img src="/images/book4.jpg" alt="Book 4" /></SwiperSlide>
                    </Swiper>
                </div>

            </section>

            {/* Features Section */}
            <section className="features">
                <div className="feature-box"><span>🚚</span><p>Free Shipping</p></div>
                <div className="feature-box"><span>🔒</span><p>Secure Payment</p></div>
                <div className="feature-box"><span>🔄</span><p>Easy Returns</p></div>
                <div className="feature-box"><span>📞</span><p>24/7 Support</p></div>
            </section>
        </div>
    );
}