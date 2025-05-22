import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../LoginPage/Login";
import Receipt from "../ReceiptPage/Receipt";
import Home from "../HomePage/Home";
import Orders from "../OrdersPage/OrdersPage";
import ProductPage from "../ProductPage/ProductPage";
import Register from "../RegistrationPage/Register";
import { CartProvider } from "../../contexts/CartContext";
import { FavoritesProvider } from "../../contexts/FavoritesContext";
import Checkout from "../CheckoutPage/Checkout";
import FavoritesPage from "../FavoritesPage/FavoritesPage";
import BookDetailPage from "../BookDetailPage/BookDetailPage";
import CategoryPage from "../CategoryPage/CategoryPage";
import Header from "../../components/Header";
import ShoppingCart from "../../components/ShoppingCart";
import FavoritesList from "../../components/FavoritesList";
import ProductManagerCommentsPage from '../ProductManager/ProductManagerCommentsPage';
import "./App.css";
import ProductManagerHome from "../ProductManager/ProductManagerHome";
import ProductManagerProductControl from "../ProductManager/ProductManagerProductControl";
import ProductManagerCategories from "../ProductManager/ProductManagerCategories";
import ProductManagerOrderControl from "../ProductManager/ProductManagerOrderControl";
import SalesManagerHome from "../SalesManager/SalesManagerHome";
import SalesManagerOrders from "../SalesManager/SalesManagerOrders";
import UserPanel from "../UserPanel/UserPanel";


function App() {
    return (
        <CartProvider>
            <FavoritesProvider>
                <div className="App">
                    <Router>
                        {/* A global header at the top */}
                        <Header />

                        {/* The ShoppingCart & FavoritesList overlays or panels */}
                        <ShoppingCart />
                        <FavoritesList />

                        <main className="main-content">
                            <Routes>
                                {/* Home page */}
                                <Route path="/" element={<Home />} />

                                {/* Auth pages */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                {/* Product listing page */}
                                <Route path="/products" element={<ProductPage />} />

                                {/* Single book detail page (by ISBN or numeric ID) */}
                                <Route path="/books/:bookId" element={<BookDetailPage />} />

                                {/* Categories, checkout, favorites */}
                                <Route path="/category/:category" element={<CategoryPage />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/favorites" element={<FavoritesPage />} />

                                <Route path="/category/:category" element={<CategoryPage />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/receipt/:orderId" element={<Receipt />} />

                                <Route path="/pm/comments" element={<ProductManagerCommentsPage />} />
                                <Route path="/pm/home" element={<ProductManagerHome />} />
                                <Route path="/pm/pcontrol" element={<ProductManagerProductControl />} />
                                <Route path="/pm/categories" element={<ProductManagerCategories />} />
                                <Route path="/pm/orders" element={<ProductManagerOrderControl />} />
                                <Route path="/sm/home" element={<SalesManagerHome/>} />
                                <Route path="/sm/orders" element={<SalesManagerOrders/>} />
                                <Route path="/profile" element={<UserPanel />} />

                            </Routes>
                        </main>
                    </Router>
                </div>
            </FavoritesProvider>
        </CartProvider>
    );
}

export default App;
