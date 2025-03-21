import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../LoginPage/Login";
import Home from "../HomePage/Home";
import ProductPage from "../ProductPage/ProductPage";
import Register from "../RegistrationPage/Register";
import { CartProvider } from "../../contexts/CartContext";
import { FavoritesProvider } from "../../contexts/FavoritesContext";
import Checkout from '../CheckoutPage/Checkout';
import Header from '../../components/Header';
import ShoppingCart from '../../components/ShoppingCart';
import FavoritesList from '../../components/FavoritesList';
import './App.css';

function App() {
    return (
        <CartProvider>
            <FavoritesProvider>
                <div className="App">
                    <Router>
                        <Header />
                        <ShoppingCart />
                        <FavoritesList />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/products" element={<ProductPage />} />
                                <Route path="/checkout" element={<Checkout />} />
                            </Routes>
                        </main>
                    </Router>
                </div>
            </FavoritesProvider>
        </CartProvider>
    );
}

export default App;
