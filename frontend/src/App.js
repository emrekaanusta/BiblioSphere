import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/Login" element={<Login />} />

                <Route path="/Home" element={<Home />} />

                <Route path="/Products" element={<ProductPage />} />
            </Routes>
        </Router>
    );
}

export default App;
