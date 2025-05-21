import React, { useState, useEffect } from "react";

const ProductManagerCategoryControl = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/products")
            .then(res => res.json())
            .then(data => {
                const uniqueTypes = [...new Set(data.map((b) => b.type))];
                setCategories(uniqueTypes);
            });
    }, []);

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
            <h2 style={{ textAlign: "center" }}>All Categories</h2>

            <ul style={{ listStyle: "none", padding: 0 }}>
                {categories.map((cat, index) => (
                    <li key={index} style={{ padding: "0.5rem 0", borderBottom: "1px solid #ddd" }}>{cat}</li>
                ))}
            </ul>
        </div>
    );
};

export default ProductManagerCategoryControl;
