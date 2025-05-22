import React, { useState, useEffect } from "react";

const ProductManagerProductControl = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        isbn: "",
        title: "",
        author: "",
        category: "",
        price: "-1",           // fixed price
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (isbn) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        const res = await fetch(`http://localhost:8080/api/products/${isbn}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
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
            fetchProducts();
        } else {
            alert("Failed to update stock");
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const payload = { ...formData, price: -1 };

        const res = await fetch("http://localhost:8080/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            fetchProducts();
            setFormData({ isbn: "", title: "", author: "", category: "", price: "-1", stock: "", description: "", publisYear: "", pages: "", language: "", publisher: "", image: "" });
        } else {
            alert("Failed to add product");
        }
    };

    const pendingProducts = products.filter(p => p.price === -1);
    const regularProducts = products.filter(p => p.price !== -1);

    // Styles
    const sectionStyle = {
        padding: '2rem',
        maxWidth: '800px',
        margin: 'auto'
    };
    const formStyle = {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    };
    const buttonPrimary = { background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', padding: '0.75rem', cursor: 'pointer', gridColumn: '1 / span 2' };
    const inputStyle = { padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' };
    const pendingCard = { background: '#fdf6e3', border: '1px solid #fceabb', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' };
    const listItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '0.75rem', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '0.75rem' };

    return (
        <div style={sectionStyle}>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Add New Product</h2>
            <form onSubmit={handleAddProduct} style={formStyle}>
                {[ 'isbn','title','author','stock','description','publisYear','pages','language','publisher' ].map(field => (
                    <input
                        key={field}
                        name={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={handleInputChange}
                        required
                        type={['stock','pages'].includes(field) ? 'number' : 'text'}
                        style={inputStyle}
                    />
                ))}
                <select name="category" value={formData.category} onChange={handleInputChange} required style={{ ...inputStyle, gridColumn: '1 / span 2' }}>
                    <option value="" disabled>Select a Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
                <input type="url" name="image" placeholder="Image URL" value={formData.image} onChange={handleInputChange} required style={{ ...inputStyle, gridColumn: '1 / span 2' }} />
                <button type="submit" style={buttonPrimary}>Add Product</button>
            </form>

            <h2 style={{ textAlign: 'center', margin: '2rem 0 1rem' }}>Existing Products</h2>
            {loading ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
                <div style={{ maxWidth: '800px', margin: 'auto' }}>
                    {pendingProducts.length > 0 && (
                        <div style={pendingCard}>
                            <strong>Waiting for the sales manager to update price:</strong>
                            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                                {pendingProducts.map(p => <li key={p.isbn}>{p.title}</li>)}
                            </ul>
                        </div>
                    )}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {regularProducts.map(p => (
                            <li key={p.isbn} style={listItem}>
                                <div>
                                    <strong>{p.title}</strong><br />
                                    Stock: {p.stock} | Price: ${p.price.toFixed(2)}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="number" placeholder="New Stock" min="0" onChange={e => p.newStock = e.target.value} style={{ width: '100px', ...inputStyle }} />
                                    <button onClick={() => handleStockUpdate(p.isbn, p.newStock)} style={{ background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', padding: '0.5rem', cursor: 'pointer' }}>Update</button>
                                    <button onClick={() => handleDelete(p.isbn)} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProductManagerProductControl;
