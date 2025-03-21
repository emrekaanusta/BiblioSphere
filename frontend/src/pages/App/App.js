import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../LoginPage/Login";
import Home from "../HomePage/Home";
import ProductPage from "../ProductPage/ProductPage";
import Register from "../RegistrationPage/Register";
import { CartProvider } from "../../contexts/CartContext";

function App() {
    return (
        <CartProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/Login" element={<Login />} />

                    <Route path="/Register" element={<Register />} />

                    <Route path="/Home" element={<Home />} />

                    <Route path="/Products" element={<ProductPage />} />
                </Routes>
            </Router>
        </CartProvider>
    );
}

export default App;
