import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, TextField, Button, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useNavigate } from 'react-router-dom';

const SalesManagerHome = () => {
    const [products, setProducts] = useState([]);
    const [newPrice, setNewPrice] = useState({});
    const [newDiscount, setNewDiscount] = useState({});
    const [notificationMessage, setNotificationMessage] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openDialog, setOpenDialog] = useState(false);
    const [usersToNotify, setUsersToNotify] = useState([]);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [notifiedUsers, setNotifiedUsers] = useState([]);
    const [openNotifiedDialog, setOpenNotifiedDialog] = useState(false);

    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/products');
            setProducts(response.data);
        } catch (error) {
            showSnackbar('Error fetching products', 'error');
        }
    };

    const handlePriceUpdate = async (productId) => {
        try {
            const res = await axios.put(
                `http://localhost:8080/api/sales-manager/product/${productId}/price`,
                { price: parseFloat(newPrice[productId]) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Fetch users who were notified
            const usersRes = await axios.get(
                `http://localhost:8080/api/sales-manager/wishlist-users/${productId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifiedUsers(usersRes.data);
            setOpenNotifiedDialog(true);
            showSnackbar('Price updated successfully', 'success');
            fetchProducts();
            setNewPrice((prev) => ({ ...prev, [productId]: '' }));
        } catch (error) {
            showSnackbar('Error updating price', 'error');
        }
    };

    const handleDiscountUpdate = async (productId) => {
        try {
            const res = await axios.put(
                `http://localhost:8080/api/sales-manager/product/${productId}/discount`,
                { discount: parseFloat(newDiscount[productId]) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Fetch users who were notified
            const usersRes = await axios.get(
                `http://localhost:8080/api/sales-manager/wishlist-users/${productId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifiedUsers(usersRes.data);
            setOpenNotifiedDialog(true);
            showSnackbar('Discount updated successfully', 'success');
            fetchProducts();
            setNewDiscount((prev) => ({ ...prev, [productId]: '' }));
        } catch (error) {
            showSnackbar('Error updating discount', 'error');
        }
    };

    const handleOpenNotificationDialog = async (productId) => {
        setCurrentProductId(productId);
        try {
            const res = await axios.get(`http://localhost:8080/api/sales-manager/wishlist-users/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsersToNotify(res.data);
            setOpenDialog(true);
        } catch (error) {
            showSnackbar('Error fetching users to notify', 'error');
        }
    };

    const handleSendNotification = async () => {
        try {
            await axios.post(
                `http://localhost:8080/api/sales-manager/wishlist-notification/${currentProductId}`,
                { message: notificationMessage[currentProductId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSnackbar('Notifications sent successfully', 'success');
            setNotificationMessage((prev) => ({ ...prev, [currentProductId]: '' }));
            setOpenDialog(false);
        } catch (error) {
            showSnackbar('Error sending notifications', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Button variant="outlined" onClick={() => navigate('/sm/orders')}>
                    Go to Orders / Invoices
                </Button>
            </div>
            <Typography variant="h4" gutterBottom>
                Sales Manager Dashboard
            </Typography>

            <Grid container spacing={3}>
                {products.map((product) => (
                    <Grid item xs={12} md={6} key={product.isbn}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {product.title}
                                </Typography>
                                <Typography color="textSecondary">
                                    {product.discountPercentage > 0 ? (
                                        <>
                                            <span style={{ textDecoration: 'line-through', color: '#888' }}>
                                                ${product.price}
                                            </span>
                                            <span style={{ color: '#d32f2f', marginLeft: 8 }}>
                                                &nbsp;Discounted Price: ${product.discountedPrice}
                                            </span>
                                            <br />
                                            <span style={{ color: '#388e3c' }}>
                                                Discount: {product.discountPercentage}%
                                            </span>
                                        </>
                                    ) : (
                                        <>Current Price: ${product.price}</>
                                    )}
                                </Typography>
                                <Typography color="textSecondary">
                                    Current Discount: {product.discountPercentage}%
                                </Typography>

                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="New Price"
                                            type="number"
                                            value={newPrice[product.isbn] || ''}
                                            onChange={(e) => setNewPrice((prev) => ({ ...prev, [product.isbn]: e.target.value }))}
                                            fullWidth
                                            size="small"
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={() => handlePriceUpdate(product.isbn)}
                                            sx={{ mt: 1 }}
                                            fullWidth
                                        >
                                            Update Price
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="New Discount %"
                                            type="number"
                                            value={newDiscount[product.isbn] || ''}
                                            onChange={(e) => setNewDiscount((prev) => ({ ...prev, [product.isbn]: e.target.value }))}
                                            fullWidth
                                            size="small"
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={() => handleDiscountUpdate(product.isbn)}
                                            sx={{ mt: 1 }}
                                            fullWidth
                                        >
                                            Update Discount
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Notification Message"
                                            multiline
                                            rows={2}
                                            value={notificationMessage[product.isbn] || ''}
                                            onChange={(e) => setNotificationMessage((prev) => ({ ...prev, [product.isbn]: e.target.value }))}
                                            fullWidth
                                        />
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleOpenNotificationDialog(product.isbn)}
                                            sx={{ mt: 1 }}
                                            fullWidth
                                        >
                                            Send Wishlist Notification
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Users to be Notified</DialogTitle>
                <DialogContent>
                    {usersToNotify.length === 0 ? (
                        <p>No users have this product in their wishlist.</p>
                    ) : (
                        <ul>
                            {usersToNotify.map((user) => (
                                <li key={user.email}>{user.username} ({user.email})</li>
                            ))}
                        </ul>
                    )}
                    <p style={{ marginTop: 16 }}><b>Message:</b> {notificationMessage[currentProductId]}</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSendNotification} variant="contained" color="primary" disabled={usersToNotify.length === 0}>
                        Send Notification
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openNotifiedDialog} onClose={() => setOpenNotifiedDialog(false)}>
                <DialogTitle>Users Notified</DialogTitle>
                <DialogContent>
                    {notifiedUsers.length === 0 ? (
                        <p>No users had this product in their wishlist.</p>
                    ) : (
                        <ul>
                            {notifiedUsers.map((user) => (
                                <li key={user.email}>{user.username} ({user.email})</li>
                            ))}
                        </ul>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNotifiedDialog(false)}>OK</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default SalesManagerHome;