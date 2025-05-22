package com.bibliosphere.backend.service;

import com.bibliosphere.backend.exception.ResourceNotFoundException;
import com.bibliosphere.backend.model.Order;
import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.repository.OrderRepository;
import com.bibliosphere.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;
    private final MongoTemplate mongo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    private OrderRepository orderRepository;

    public Product getProductById(String productId) {
        return repo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }

    /**
     * Atomically decrement stock (-1) **only if** current stock > 0 using partial update.
     */
    public Product decrementStock(String isbn) {
        Query q = Query.query(Criteria.where("_id").is(isbn).and("stock").gt(0));
        Update u = new Update().inc("stock", -1);

        Product updated = mongo.findAndModify(
                q, u,
                FindAndModifyOptions.options().returnNew(true),
                Product.class
        );

        if (updated == null) {
            throw new ResourceNotFoundException("Product not found or out of stock: " + isbn);
        }
        return updated;
    }

    /**
     * Helper to reset stock to a specific quantity (dev/testing) using partial update to avoid wipe.
     */
    public Product resetStock(String isbn, int qty) {
        Query q = Query.query(Criteria.where("_id").is(isbn));
        Update u = new Update().set("stock", qty);

        Product updated = mongo.findAndModify(
                q, u,
                FindAndModifyOptions.options().returnNew(true),
                Product.class
        );

        if (updated == null) {
            throw new ResourceNotFoundException("Product not found with id: " + isbn);
        }
        return updated;
    }

    /**
     * Update product price and calculate discounted price if discount percentage exists
     */
    public Product updateProductPrice(String productId, Double newPrice) {
        Product product = getProductById(productId);
        product.setPrice(newPrice);
        
        // Update the discounted price if there's a discount percentage
        if (product.getDiscountPercentage() > 0) {
            double discountedPrice = newPrice * (1 - product.getDiscountPercentage() / 100);
            // Round to 2 decimal places
            discountedPrice = Math.round(discountedPrice * 100.0) / 100.0;
            product.setDiscountedPrice(discountedPrice);
        } else {
            product.setDiscountedPrice(newPrice);
        }
        
        Product updated = repo.save(product);
        
        // Notify users about price change
        notifyWishlistUsersAboutChange(product, "price");
        return updated;
    }

    /**
     * Update discount percentage and calculate discounted price
     */
    public Product updateProductDiscount(String productId, Double discountPercentage) {
        Product product = getProductById(productId);
        product.setDiscountPercentage(discountPercentage);
        
        double discountedPrice = product.getPrice() * (1 - discountPercentage / 100);
        // Round to 2 decimal places
        discountedPrice = Math.round(discountedPrice * 100.0) / 100.0;
        product.setDiscountedPrice(discountedPrice);
        
        Product updated = repo.save(product);
        
        // Notify users about discount change
        notifyWishlistUsersAboutChange(product, "discount");
        return updated;
    }

    private void notifyWishlistUsersAboutChange(Product product, String changeType) {
        List<User> usersWithWishlist = userService.getUsersWithProductInWishlist(product.getIsbn());
        String subject = "Update about your wishlisted item: " + product.getTitle();
        String message;
        if ("price".equals(changeType)) {
            message = "The price of a book in your wishlist has changed!\n\n" +
                      "Product: " + product.getTitle() + "\n" +
                      "New Price: $" + String.format("%.2f", product.getPrice()) + "\n" +
                      (product.getDiscountPercentage() > 0 ?
                      "Discount: " + product.getDiscountPercentage() + "%\n" +
                      "Discounted Price: $" + String.format("%.2f", product.getDiscountedPrice()) + "\n" : "") +
                      "\nBest regards,\nBiblioSphere Team";
        } else {
            message = "A discount has been applied to a book in your wishlist!\n\n" +
                      "Product: " + product.getTitle() + "\n" +
                      "Discount: " + product.getDiscountPercentage() + "%\n" +
                      "Discounted Price: $" + String.format("%.2f", product.getDiscountedPrice()) + "\n" +
                      "\nBest regards,\nBiblioSphere Team";
        }
        
        for (User user : usersWithWishlist) {
            emailService.sendEmail(user.getEmail(), subject, message);
        }
    }

    public void sendRefundStatusNotification(String orderId, Boolean isAccepted, String message) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        User user = order.getUser();
        String emailSubject = "Update on your refund request for Order #" + orderId;
        String status = isAccepted ? "Accepted" : "Rejected";
        String emailBody = "Dear " + user.getUsername() + ",\n\n" +
                          "Your refund request for Order #" + orderId + " has been " + status + ".\n\n" +
                          message + "\n\n" +
                          "If you have any questions, please contact our customer support.\n\n" +
                          "Best regards,\nBiblioSphere Team";
        emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
    }

    public void sendWishlistNotifications(String productId, String message) {
        Product product = getProductById(productId);
        List<User> usersWithWishlist = userService.getUsersWithProductInWishlist(productId);
        for (User user : usersWithWishlist) {
            String emailSubject = "Update about your wishlisted item: " + product.getTitle();
            String emailBody = "Dear " + user.getUsername() + ",\n\n" +
                             message + "\n\n" +
                             "Product: " + product.getTitle() + "\n" +
                             "Current Price: $" + String.format("%.2f", product.getPrice()) + "\n" +
                             (product.getDiscountPercentage() > 0 ?
                             "Discount: " + product.getDiscountPercentage() + "%\n" +
                             "Discounted Price: $" + String.format("%.2f", product.getDiscountedPrice()) + "\n" : "") +
                             "\nBest regards,\nBiblioSphere Team";
            emailService.sendEmail(user.getEmail(), emailSubject, emailBody);
        }
    }
}
