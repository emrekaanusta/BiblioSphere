import React from "react";
import { useNavigate, Navigate } from "react-router-dom";

const ProductManagerHome = () => {
    const navigate = useNavigate();
    const isPM = localStorage.getItem("isPM") === "true";

    if (!isPM) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="manager-home" style={{ padding: "2rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Product Management Panel</h1>
            <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>Choose an action:</p>

            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                <button
                    onClick={() => navigate("/pm/pcontrol")}
                    style={{
                        padding: "0.75rem 1.5rem",
                        fontSize: "1rem",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease"
                    }}
                    onMouseOver={e => (e.target.style.backgroundColor = "#0056b3")}
                    onMouseOut={e => (e.target.style.backgroundColor = "#007bff")}
                >
                    Manage Products
                </button>

                <button
                    onClick={() => navigate("/pm/categories")}
                    style={{
                        padding: "0.75rem 1.5rem",
                        fontSize: "1rem",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease"
                    }}
                    onMouseOver={e => (e.target.style.backgroundColor = "#1e7e34")}
                    onMouseOut={e => (e.target.style.backgroundColor = "#28a745")}
                >
                    Manage Categories
                </button>

                <button
                    onClick={() => navigate("/pm/comments")}
                    style={{
                        padding: "0.75rem 1.5rem",
                        fontSize: "1rem",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease"
                    }}
                    onMouseOver={e => (e.target.style.backgroundColor = "#5a6268")}
                    onMouseOut={e => (e.target.style.backgroundColor = "#6c757d")}
                >
                    Manage Comments
                </button>
                <button
                    onClick={() => navigate("/pm/orders")}
                    style={{
                        padding: "0.75rem 1.5rem",
                        fontSize: "1rem",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease"
                    }}
                    onMouseOver={e => (e.target.style.backgroundColor = "#117a8b")}
                    onMouseOut={e => (e.target.style.backgroundColor = "#17a2b8")}
                >
                    Manage Orders
                </button>
            </div>
        </div>
    );
};

export default ProductManagerHome;