import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProductManagerProductControl = () => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
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

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            isbn: product.isbn,
            title: product.title,
            author: product.author,
            category: product.category,
            price: product.price.toString(),
            stock: product.stock.toString(),
            description: product.description,
            publisYear: product.publisYear,
            pages: product.pages.toString(),
            language: product.language,
            publisher: product.publisher,
            image: product.image
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData };

        const res = await fetch(`http://localhost:8080/api/products/${editingProduct.isbn}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            fetchProducts();
            setEditingProduct(null);
            setFormData({
                isbn: "",
                title: "",
                author: "",
                category: "",
                price: "-1",
                stock: "",
                description: "",
                publisYear: "",
                pages: "",
                language: "",
                publisher: "",
                image: ""
            });
        } else {
            alert("Failed to update product");
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
            setFormData({
                isbn: "",
                title: "",
                author: "",
                category: "",
                price: "-1",
                stock: "",
                description: "",
                publisYear: "",
                pages: "",
                language: "",
                publisher: "",
                image: ""
            });
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
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    };
    const buttonPrimary = {
        background: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        padding: '0.75rem',
        cursor: 'pointer',
        gridColumn: '1 / span 2'
    };
    const inputStyle = {
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ccc'
    };
    const pendingCard = {
        background: '#fdf6e3',
        border: '1px solid #fceabb',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem'
    };
    const listItem = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '0.75rem',
        borderRadius: '6px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        marginBottom: '0.75rem'
    };
    const editButton = {
        background: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '0.5rem',
        cursor: 'pointer',
        marginRight: '0.5rem'
    };

    // Add new styles for user profile section
    const userProfileStyle = {
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        zIndex: 1000,
        transition: 'all 0.2s ease'
    };

    const dropdownStyle = {
        position: 'absolute',
        top: 'calc(100% + 0.5rem)',
        right: '0',
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 1001,
        minWidth: '180px',
        overflow: 'hidden'
    };

    const dropdownItemStyle = {
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: 'transparent',
        width: '100%',
        textAlign: 'left',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#333',
        transition: 'background-color 0.2s ease'
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isPM');
        navigate('/login');
    };

    return (
        <div style={{ position: 'relative', paddingTop: '4rem' }}>
            <div style={userProfileStyle} onClick={() => setShowDropdown(!showDropdown)}>
                <i className="fas fa-user-circle" style={{ fontSize: '1.5rem', color: '#007bff' }}></i>
                <span style={{ fontWeight: 500 }}>Product Manager</span>
                <i className={`fas fa-caret-${showDropdown ? 'up' : 'down'}`} style={{ fontSize: '0.8rem', color: '#666' }}></i>
            </div>
            {showDropdown && (
                <div style={dropdownStyle}>
                    <button 
                        style={dropdownItemStyle}
                        onClick={() => {
                            navigate('/pm/pcontrol');
                            setShowDropdown(false);
                        }}
                        onMouseOver={e => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseOut={e => e.target.style.backgroundColor = 'transparent'}
                    >
                        <i className="fas fa-box" style={{ color: '#007bff' }}></i>
                        Products
                    </button>
                    <button 
                        style={dropdownItemStyle}
                        onClick={handleLogout}
                        onMouseOver={e => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseOut={e => e.target.style.backgroundColor = 'transparent'}
                    >
                        <i className="fas fa-sign-out-alt" style={{ color: '#dc3545' }}></i>
                        Log Out
                    </button>
                </div>
            )}
            <div style={sectionStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={editingProduct ? handleEditSubmit : handleAddProduct} style={formStyle}>
                    {['isbn', 'title', 'author', 'stock', 'description', 'publisYear', 'pages', 'language', 'publisher'].map(field => (
                        <input
                            key={field}
                            name={field}
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            value={formData[field]}
                            onChange={handleInputChange}
                            required
                            type={['stock', 'pages'].includes(field) ? 'number' : 'text'}
                            style={inputStyle}
                            disabled={editingProduct && field === 'isbn'}
                        />
                    ))}
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        style={{ ...inputStyle, gridColumn: '1 / span 2' }}
                    >
                        <option value="" disabled>Select a Category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                    <input
                        type="url"
                        name="image"
                        placeholder="Image URL"
                        value={formData.image}
                        onChange={handleInputChange}
                        required
                        style={{ ...inputStyle, gridColumn: '1 / span 2' }}
                    />
                    <button type="submit" style={buttonPrimary}>
                        {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    {editingProduct && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingProduct(null);
                                setFormData({
                                    isbn: "",
                                    title: "",
                                    author: "",
                                    category: "",
                                    price: "-1",
                                    stock: "",
                                    description: "",
                                    publisYear: "",
                                    pages: "",
                                    language: "",
                                    publisher: "",
                                    image: ""
                                });
                            }}
                            style={{
                                ...buttonPrimary,
                                background: '#6c757d',
                                marginTop: '0.5rem'
                            }}
                        >
                            Cancel Edit
                        </button>
                    )}
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
                                        <input
                                            type="number"
                                            placeholder="New Stock"
                                            min="0"
                                            onChange={e => p.newStock = e.target.value}
                                            style={{ width: '100px', ...inputStyle }}
                                        />
                                        <button
                                            onClick={() => handleStockUpdate(p.isbn, p.newStock)}
                                            style={{
                                                background: '#ffc107',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '0.5rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Update Stock
                                        </button>
                                        <button
                                            onClick={() => handleEdit(p)}
                                            style={editButton}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.isbn)}
                                            style={{
                                                background: '#dc3545',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '0.5rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductManagerProductControl;
