import React from "react";
import { useNavigate, Navigate } from "react-router-dom";

const SalesManagerHome = () => {
    const navigate = useNavigate();
    const isSales = localStorage.getItem("isSales") === "true";

    if (!isSales) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="manager-home" style={{ padding: "2rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Sales Manager Panel</h1>
            <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>Select A Task:</p>

            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                <button
                    onClick={() => navigate("/sm/orders")}
                    style={buttonStyle("#007bff", "#0056b3")}
                >
                    Manage Orders
                </button>

                <button
                    onClick={() => navigate("/sm/pricing")}
                    style={buttonStyle("#ffc107", "#e0a800")}
                >
                    Product Pricing
                </button>

                <button
                    onClick={() => navigate("/sm/refunds")}
                    style={buttonStyle("#dc3545", "#bd2130")}
                >
                    Refund Requests
                </button>
            </div>
        </div>
    );
};

function buttonStyle(bg, hover) {
    return {
        padding: "0.75rem 1.5rem",
        fontSize: "1rem",
        backgroundColor: bg,
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        onMouseOver: e => (e.target.style.backgroundColor = hover),
        onMouseOut: e => (e.target.style.backgroundColor = bg)
    };
}

export default SalesManagerHome;