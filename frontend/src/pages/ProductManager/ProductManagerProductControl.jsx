import React, { useState, useEffect } from "react";

const ProductManagerProductControl = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        isbn: "",
        title: "",
        author: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        publisYear: "",
        pages: "",
        language: "",
        publisher: "",
        image: ""
    });
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = () => {
        fetch("http://localhost:8080/api/products")
            .then(res => res.json())
            .then(setProducts)
            .finally(() => setLoading(false));
    };

    const fetchCategories = () => {
        fetch("http://localhost:8080/api/categories")
            .then(res => res.json())
            .then(setCategories)
            .catch(() => alert("Failed to load categories"));
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "file") {
            setFormData(prev => ({ ...prev, file: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDelete = async (isbn) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        const res = await fetch(`http://localhost:8080/api/products/${isbn}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            alert("Product deleted successfully");
            fetchProducts();
        } else {
            alert("Failed to delete product");
        }
    };

    const handleStockUpdate = async (isbn, newStock) => {
        const res = await fetch(`http://localhost:8080/api/products/${isbn}/reset/${newStock}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            alert("Stock updated");
            fetchProducts();
        } else {
            alert("Failed to update stock");
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
const res = await fetch("http://localhost:8080/api/products", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(formData)
});

        if (res.ok) {
            alert("Product added successfully");
            fetchProducts();
            setFormData({
                isbn: "",
                title: "",
                author: "",
                category: "",
                price: "",
                stock: "",
                description: "",
                publisYear: "",
                pages: "",
                language: "",
                publisher: "",
                file: null
            });
        } else {
            alert("Failed to add product");
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2 style={{ textAlign: "center" }}>Add New Product</h2>
            <form
                onSubmit={handleAddProduct}
                encType="multipart/form-data"
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    maxWidth: "800px",
                    margin: "auto",
                    padding: "1.5rem",
                    background: "#f8f9fa",
                    borderRadius: "8px"
                }}
            >
                {[
                    "isbn",
                    "title",
                    "author",
                    "price",
                    "stock",
                    "description",
                    "publisYear",
                    "pages",
                    "language",
                    "publisher"
                ].map((field) => (
                    <input
                        key={field}
                        name={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={handleInputChange}
                        required
                        type={field === "price" || field === "stock" || field === "pages" ? "number" : "text"}
                        style={{
                            padding: "0.5rem",
                            borderRadius: "4px",
                            border: "1px solid #ccc"
                        }}
                    />
                ))}

                {/* Dynamic Category Dropdown */}
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    style={{
                        gridColumn: "1 / span 2",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                    }}
                >
                    <option value="" disabled>Select a Category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <input
                    type="url"
                    name="image"
                    placeholder="Image URL"
                    value={formData.image}
                    onChange={handleInputChange}
                    required
                    style={{
                        gridColumn: "1 / span 2",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                    }}
                    />

                <button
                    type="submit"
                    style={{
                        gridColumn: "1 / span 2",
                        padding: "0.75rem",
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Add Product
                </button>
            </form>

            <h2 style={{ marginTop: "2rem", textAlign: "center" }}>Existing Products</h2>
            <div style={{ maxWidth: "800px", margin: "auto" }}>
                {loading ? <p>Loading...</p> : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {products.map(p => (
                            <li
                                key={p.isbn}
                                style={{
                                    padding: "0.5rem 0",
                                    borderBottom: "1px solid #ddd",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <span>{p.title} — Stock: {p.stock}</span>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <input
                                        type="number"
                                        placeholder="New Stock"
                                        min="0"
                                        style={{ width: "80px", padding: "0.25rem" }}
                                        onChange={(e) => p.newStock = e.target.value}
                                    />
                                    <button
                                        onClick={() => handleStockUpdate(p.isbn, p.newStock)}
                                        style={{
                                            background: "#ffc107",
                                            color: "black",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "0.25rem 0.5rem",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.isbn)}
                                        style={{
                                            background: "#dc3545",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "0.25rem 0.75rem",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ProductManagerProductControl;
