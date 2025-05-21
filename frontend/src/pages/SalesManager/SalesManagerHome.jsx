import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, TextField, Button, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const SalesManagerHome = () => {
    const [products, setProducts] = useState([]);
    const [newPrice, setNewPrice] = useState({});
    const [newDiscount, setNewDiscount] = useState({});
    const [notificationMessage, setNotificationMessage] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const token = localStorage.getItem('token');

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
            await axios.put(
                `http://localhost:8080/api/sales-manager/product/${productId}/price`,
                { price: parseFloat(newPrice[productId]) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSnackbar('Price updated successfully', 'success');
            fetchProducts();
            setNewPrice((prev) => ({ ...prev, [productId]: '' }));
        } catch (error) {
            showSnackbar('Error updating price', 'error');
        }
    };

    const handleDiscountUpdate = async (productId) => {
        try {
            await axios.put(
                `http://localhost:8080/api/sales-manager/product/${productId}/discount`,
                { discount: parseFloat(newDiscount[productId]) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSnackbar('Discount updated successfully', 'success');
            fetchProducts();
            setNewDiscount((prev) => ({ ...prev, [productId]: '' }));
        } catch (error) {
            showSnackbar('Error updating discount', 'error');
        }
    };

    const handleWishlistNotification = async (productId) => {
        try {
            await axios.post(
                `http://localhost:8080/api/sales-manager/wishlist-notification/${productId}`,
                { message: notificationMessage[productId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSnackbar('Notifications sent successfully', 'success');
            setNotificationMessage((prev) => ({ ...prev, [productId]: '' }));
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
                                            onClick={() => handleWishlistNotification(product.isbn)}
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