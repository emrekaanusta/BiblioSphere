import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import jsPDF from "jspdf";
import emailjs from "@emailjs/browser";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button
} from "@mui/material";
import axios from "axios";

const loadImageAsBase64 = (url) =>
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Image fetch failed");
            return res.blob();
        })
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject("Failed to read image as base64");
            reader.readAsDataURL(blob);
        }));

const RevenueChart = ({ orders }) => {
    const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let cumulative = 0;
    const data = sortedOrders.map(order => {
        cumulative += order.total || 0;
        return {
            date: new Date(order.createdAt).toLocaleDateString(),
            cumulativeRevenue: cumulative.toFixed(2),
        };
    });

    return (
        <div style={{ marginBottom: "3rem" }}>
            <h3 style={{ textAlign: "center" }}>Cumulative Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cumulativeRevenue" stroke="#007bff" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const SalesManagerOrders = () => {
    const isSales = localStorage.getItem("isSales") === "true";
    const token = localStorage.getItem("token");
    const isFakeSalesToken = token === "fake-sales-token";

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [invoiceStartDate, setInvoiceStartDate] = useState('');
    const [invoiceEndDate, setInvoiceEndDate] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [showInvoices, setShowInvoices] = useState(false);
    const [showOnlyPendingRefunds, setShowOnlyPendingRefunds] = useState(false);

    const fetchOrders = async () => {
        try {
            // First fetch all orders
            const response = await fetch("http://localhost:8080/api/orders/all", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch orders");
            const data = await response.json();
            setOrders(data);
            
            // Also fetch pending refunds specifically
            const refundsResponse = await fetch("http://localhost:8080/api/orders/refunds/pending", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (refundsResponse.ok) {
                const refundsData = await refundsResponse.json();
                // Add any pending refunds that weren't already in the orders list
                const existingIds = new Set(data.map(o => o.id));
                const newRefunds = refundsData.filter(r => !existingIds.has(r.id));
                if (newRefunds.length > 0) {
                    setOrders(prev => [...prev, ...newRefunds]);
                }
            }
            
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isSales) return;
        fetchOrders();
    }, [isSales, token]);

    const filteredOrders = orders.filter(order => {
        const isPendingRefund = order.refundStatus === "PENDING" || order.status === "REFUND_PENDING";
        
        // If we're showing only pending refunds, exclude them from the main list
        // since they'll appear in the dedicated section above
        if (showOnlyPendingRefunds && isPendingRefund) return false;
        
        if (showOnlyPendingRefunds && !isPendingRefund) return false;
        if (!startDate && !endDate) return true;
        const created = new Date(order.createdAt);
        const start = startDate ? new Date(startDate + "T00:00:00") : new Date("0000-01-01");
        const end = endDate ? new Date(endDate + "T23:59:59") : new Date("9999-12-31");
        return created >= start && created <= end;
    });

    const downloadInvoice = async (order) => {
        const doc = new jsPDF();

        try {
            const logoBase64 = await loadImageAsBase64(
                "https://res.cloudinary.com/xxx/image/upload/w_150,f_auto/logo.png"
            );
            doc.addImage(logoBase64, "PNG", 150, 10, 40, 20);
        } catch (err) {
            console.warn("⚠️ Logo yüklenemedi.");
        }

        doc.setFontSize(18);
        doc.text("BiblioSphere Invoice", 14, 22);

        doc.setFontSize(12);
        doc.text(`Order ID: ${order.id}`, 14, 35);
        doc.text(`Email: ${order.userEmail}`, 14, 42);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 49);

        let currentY = 60;

        doc.setFontSize(14);
        doc.text("Products:", 14, currentY);
        currentY += 5;

        for (let item of order.items || []) {
            const { title: productName, quantity, price, image } = item;

            if (currentY > 270) {
                doc.addPage();
                currentY = 20;
            }

            try {
                const optimizedImageUrl = image.replace("/upload/", "/upload/w_100,h_100,c_fill,f_auto/");
                const imageBase64 = await loadImageAsBase64(optimizedImageUrl);
                doc.addImage(imageBase64, "JPEG", 14, currentY, 25, 25);
            } catch (err) {
                console.warn(`⚠️ Görsel yüklenemedi: ${image}`);
            }

            doc.setFontSize(11);
            doc.text(`Product: ${productName}`, 42, currentY + 5);
            doc.text(`Qty: ${quantity}`, 42, currentY + 11);
            doc.text(`Price: $${price.toFixed(2)}`, 42, currentY + 17);
            doc.text(`Total: $${(quantity * price).toFixed(2)}`, 42, currentY + 23);

            currentY += 35;
        }

        doc.setFontSize(13);
        doc.text(`Total Amount: $${order.total?.toFixed(2) ?? "N/A"}`, 14, currentY + 10);

        doc.save(`invoice-${order.id}.pdf`);
    };

    const sendRefundEmail = (order, action) => {
        const email = order?.shippingInfo?.email || order.userEmail || "";
        const name = order?.shippingInfo
            ? `${order.shippingInfo.firstName || ""} ${order.shippingInfo.lastName || ""}`.trim()
            : order.userEmail;

        const templateParams = {
            to_email: email,
            order_date: new Date(order.createdAt).toLocaleDateString(),
            refund_status: action === "accept" ? "APPROVED" : "REJECTED",
            name,
            order_id: order.id,
        };

        if (!email || !name || !order.id) {
            console.warn("Missing email parameters:", templateParams);
            return;
        }

        emailjs.send(
            "service_sp2mkzq",
            "template_ipwyftj",
            templateParams,
            "YHWWSBWcWWeVfPUUd"
        ).then(() => {
            console.log(`Refund ${action} email sent to ${templateParams.to_email}`);
        }).catch((err) => {
            console.error("Failed to send refund status email", err);
        });
    };

    const handleRefundDecision = async (orderId, action) => {
        const confirmed = window.confirm(`Are you sure you want to ${action} this refund request?`);
        if (!confirmed) return;

        try {
            const res = await fetch(`http://localhost:8080/api/orders/refunds/${orderId}?action=${action}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Failed to update refund status");
            const updated = await res.json();
            sendRefundEmail(updated, action);
            setOrders(prev => prev.filter(o => o.id !== orderId));
            
            setSnackbar({
                open: true,
                message: `Refund ${action === 'accept' ? 'approved' : 'rejected'}. Customer has been notified.`,
                severity: 'success'
            });
        } catch (err) {
            alert(err.message);
        }
    };

    const fetchInvoicesInRange = async () => {
        if (!invoiceStartDate || !invoiceEndDate) return;
        try {
            const res = await fetch(`http://localhost:8080/api/orders/range?start=${invoiceStartDate}&end=${invoiceEndDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch invoices');
            const data = await res.json();
            setInvoices(data);
            setShowInvoices(true);
        } catch (err) {
            setInvoices([]);
            setShowInvoices(true);
        }
    };

    const getRevenueChartData = () => {
        if (!invoices.length) return [];
        // Group by date
        const dateMap = {};
        invoices.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString();
            if (!dateMap[date]) dateMap[date] = 0;
            dateMap[date] += order.total || 0;
        });
        // Convert to array and sort by date
        return Object.entries(dateMap)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    if (!isSales) return <Navigate to="/login" replace />;
    if (loading) return <p style={{ textAlign: "center" }}>Loading orders…</p>;
    if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

    // Filter out pending refund requests
    const pendingRefundOrders = orders.filter(order => 
        order.refundStatus === "PENDING" || order.status === "REFUND_PENDING"
    );

    return (
        <div style={{ padding: "2rem", maxWidth: "1000px", margin: "auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>All Orders</h2>
            
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                        marginRight: "1rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontSize: "1rem"
                    }}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontSize: "1rem"
                    }}
                />
                <Button
                    variant={showOnlyPendingRefunds ? "contained" : "outlined"}
                    color="secondary"
                    style={{ marginLeft: 16 }}
                    onClick={() => setShowOnlyPendingRefunds(v => !v)}
                >
                    {showOnlyPendingRefunds ? "Show All Orders" : "Show Only Pending Refunds"}
                </Button>
            </div>

            {/* Show the refund requests section when showOnlyPendingRefunds is true */}
            {showOnlyPendingRefunds && pendingRefundOrders.length > 0 && (
                <div style={{ marginBottom: "3rem" }}>
                    <h2>Sales Manager - Refund Requests</h2>
                    {pendingRefundOrders.map(order => (
                        <div key={order.id} style={{ background: "#f7f7f7", padding: 20, borderRadius: 10, marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <strong>Order ID:</strong> {order.id}<br />
                                    <strong>User:</strong> {order.userEmail}<br />
                                    <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}<br />
                                    <strong>Status:</strong> {order.status}
                                </div>
                                <div>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        style={{ marginRight: 8 }}
                                        onClick={() => handleRefundDecision(order.id, "accept")}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleRefundDecision(order.id, "reject")}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredOrders.length > 0 && <RevenueChart orders={filteredOrders} />}

            {filteredOrders.length === 0 ? (
                <p style={{ textAlign: "center" }}>No orders found in selected range.</p>
            ) : (
                filteredOrders.map(order => (
                    <div
                        key={order.id}
                        style={{
                            background: (order.refundStatus === "PENDING" || order.status === "REFUND_PENDING") ? "#fffbe6" : "#f9f9f9",
                            border: (order.refundStatus === "PENDING" || order.status === "REFUND_PENDING") ? "2px solid #ff9800" : "none",
                            padding: "1rem",
                            marginBottom: "1rem",
                            borderRadius: "10px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                            <div style={{ flex: "1 1 60%" }}>
                                <h4 style={{ margin: 0 }}>Order ID: {order.id}</h4>
                                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#555" }}>
                                    {order.shippingInfo && (order.shippingInfo.firstName || order.shippingInfo.lastName)
                                        ? `${order.shippingInfo.firstName || ''} ${order.shippingInfo.lastName || ''}`.trim()
                                        : (order.userEmail || '')}
                                </p>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.95rem', color: '#333' }}>
                                    {order.items && order.items.map(item => (
                                        <li key={item.productId}>
                                            {item.title} x{item.quantity} (${item.price.toFixed(2)} each)
                                        </li>
                                    ))}
                                </ul>
                                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "#777" }}>
                                    {new Date(order.createdAt).toLocaleDateString()} — ${order.total?.toFixed(2) ?? "N/A"}
                                </p>
                            </div>
                            <div style={{ flex: "1 1 35%", textAlign: "right" }}>
                                <p>Status: <strong>{order.status}</strong></p>
                                <p>Refund: {order.refundStatus || (order.status === "REFUND_PENDING" ? "PENDING" : "N/A")}</p>
                                <div style={{ marginTop: "0.5rem" }}>
                                    {(order.refundStatus === "PENDING" || order.status === "REFUND_PENDING") && (
                                        <>
                                            <button
                                                onClick={() => handleRefundDecision(order.id, "accept")}
                                                style={buttonStyle("#4caf50")}
                                            >
                                                Accept Refund
                                            </button>
                                            <button
                                                onClick={() => handleRefundDecision(order.id, "reject")}
                                                style={buttonStyle("#f44336")}
                                            >
                                                Reject Refund
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => downloadInvoice(order)}
                                        style={buttonStyle("#007bff")}
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* Date range for invoices */}
            <div style={{ margin: '2rem 0', textAlign: 'center' }}>
                <TextField
                    label="Start Date"
                    type="date"
                    value={invoiceStartDate}
                    onChange={e => setInvoiceStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    style={{ marginRight: 16 }}
                />
                <TextField
                    label="End Date"
                    type="date"
                    value={invoiceEndDate}
                    onChange={e => setInvoiceEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    style={{ marginRight: 16 }}
                />
                <Button variant="contained" onClick={fetchInvoicesInRange} disabled={!invoiceStartDate || !invoiceEndDate}>
                    Show Invoices
                </Button>
            </div>
            {showInvoices && (
                <div style={{ margin: '2rem 0' }}>
                    <h3>Invoices from {invoiceStartDate} to {invoiceEndDate}</h3>
                    {invoices.length === 0 ? (
                        <p>No invoices found in this range.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Order ID</th>
                                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Customer</th>
                                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Email</th>
                                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Items</th>
                                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Date</th>
                                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(order => (
                                    <tr key={order.id}>
                                        <td style={{ border: '1px solid #ccc', padding: 8 }}>{order.id}</td>
                                        <td style={{ border: '1px solid #ccc', padding: 8 }}>{order.shippingInfo ? `${order.shippingInfo.firstName || ''} ${order.shippingInfo.lastName || ''}`.trim() : ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: 8 }}>{order.userEmail || (order.shippingInfo && order.shippingInfo.email) || ''}</td>
                                        <td style={{ border: '1px solid #ccc', padding: 8 }}>
                                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                                {order.items && order.items.map(item => (
                                                    <li key={item.productId}>
                                                        {item.title} x{item.quantity} (${item.price.toFixed(2)} each)
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: 8 }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td style={{ border: '1px solid #ccc', padding: 8 }}>${order.total?.toFixed(2) ?? 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {showInvoices && invoices.length > 0 && (
                <div style={{ margin: '2rem 0' }}>
                    <h3>Revenue Chart</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getRevenueChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#007bff" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 16, fontWeight: 'bold' }}>
                        Total Revenue: ${invoices.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
                    </div>
                </div>
            )}

            {snackbar.open && (
                <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
                    <div style={{ background: snackbar.severity === 'success' ? '#4caf50' : '#f44336', color: 'white', padding: '12px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        {snackbar.message}
                        <Button style={{ color: 'white', marginLeft: 16 }} onClick={() => setSnackbar({ ...snackbar, open: false })}>Close</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const buttonStyle = (bg) => ({
    backgroundColor: bg,
    color: "white",
    padding: "0.4rem 0.75rem",
    margin: "0.25rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem"
});

export default SalesManagerOrders;