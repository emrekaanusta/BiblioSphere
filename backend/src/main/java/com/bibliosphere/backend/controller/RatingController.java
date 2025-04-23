package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.Rating;
import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.model.Order;
import com.bibliosphere.backend.model.OrderStatus;
import com.bibliosphere.backend.repository.RatingRepository;
import com.bibliosphere.backend.repository.ProductRepository;
import com.bibliosphere.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    @Autowired
    private RatingRepository ratingRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private OrderRepository orderRepo;

    @GetMapping("/check")
    public boolean hasUserRated(@RequestParam String productId, Authentication auth) {
        String userId = auth.getName();
        return ratingRepo.findByUserIdAndProductId(userId, productId).isPresent();
    }

    @GetMapping("/can-rate")
    public boolean canUserRate(@RequestParam String productId, Authentication auth) {
        String userId = auth.getName();
        // Check if user has already rated
        if (ratingRepo.findByUserIdAndProductId(userId, productId).isPresent()) {
            return false;
        }
        // Check if user has purchased and received the book
        List<Order> orders = orderRepo.findAllByUserEmailOrderByCreatedAtDesc(userId);
        return orders.stream()
            .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
            .anyMatch(order -> order.getItems().stream()
                .anyMatch(item -> item.getProductId().equals(productId)));
    }

    @PostMapping
    public Rating submitRating(@RequestBody Rating rating, Authentication auth) {
        String userId = auth.getName();
        rating.setUserId(userId);
        if (rating.getComment() != null && !rating.getComment().isBlank()) {
            rating.setVisible(false); // ✅ add this line
        }

        Optional<Rating> existing = ratingRepo.findByUserIdAndProductId(userId, rating.getProductId());
        if (existing.isPresent()) {
            throw new RuntimeException("User has already rated this product");
        }

        rating.setSubmittedAt(LocalDateTime.now());

        // ✅ Hide comment by default
        if (rating.getComment() != null && !rating.getComment().isBlank()) {
            rating.setVisible(false); // Hidden until admin approves
        }

        Rating savedRating = ratingRepo.save(rating);

        // ✅ Recalculate average rating
        List<Rating> allRatings = ratingRepo.findByProductId(rating.getProductId());
        float avg = (float) allRatings.stream().mapToInt(Rating::getRating).average().orElse(0);

        productRepo.findById(rating.getProductId()).ifPresent(product -> {
            product.setRating(avg);
            productRepo.save(product); // only update rating
        });

        return savedRating;
    }

    @GetMapping("/product/{productId}")
    public List<Rating> getRatingsByProduct(@PathVariable String productId) {
        return ratingRepo.findByProductId(productId);
    }
}
