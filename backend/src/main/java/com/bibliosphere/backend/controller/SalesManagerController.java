package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.service.EmailService;
import com.bibliosphere.backend.service.ProductService;
import com.bibliosphere.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sales-manager")
@CrossOrigin(origins = "http://localhost:3000")
public class SalesManagerController {

    @Autowired
    private ProductService productService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @PutMapping("/product/{productId}/price")
    public ResponseEntity<?> updateProductPrice(@PathVariable String productId, @RequestBody Map<String, Double> request) {
        Double newPrice = request.get("price");
        Product updatedProduct = productService.updateProductPrice(productId, newPrice);
        return ResponseEntity.ok(updatedProduct);
    }

    @PutMapping("/product/{productId}/discount")
    public ResponseEntity<?> updateProductDiscount(@PathVariable String productId, @RequestBody Map<String, Double> request) {
        Double discountPercentage = request.get("discount");
        Product updatedProduct = productService.updateProductDiscount(productId, discountPercentage);
        return ResponseEntity.ok(updatedProduct);
    }

    @PostMapping("/wishlist-notification/{productId}")
    public ResponseEntity<?> sendWishlistNotifications(@PathVariable String productId, @RequestBody Map<String, String> request) {
        String message = request.get("message");
        productService.sendWishlistNotifications(productId, message);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refund/{orderId}/status")
    public ResponseEntity<?> sendRefundStatus(@PathVariable String orderId, @RequestBody Map<String, Object> request) {
        Boolean isAccepted = (Boolean) request.get("isAccepted");
        String message = (String) request.get("message");
        productService.sendRefundStatusNotification(orderId, isAccepted, message);
        return ResponseEntity.ok().build();
    }
} 