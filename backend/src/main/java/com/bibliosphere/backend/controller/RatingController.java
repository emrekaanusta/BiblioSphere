package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.Rating;
import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.model.Order;
import com.bibliosphere.backend.model.OrderStatus;
import com.bibliosphere.backend.repository.RatingRepository;
import com.bibliosphere.backend.repository.ProductRepository;
import com.bibliosphere.backend.repository.OrderRepository;
import com.bibliosphere.backend.service.RatingMigrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    @Autowired
    private RatingRepository ratingRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private RatingMigrationService migrationService;

    @PostMapping("/migrate")
    public ResponseEntity<String> migrateRatings() {
        try {
            migrationService.migrateRatings();
            return ResponseEntity.ok("Rating migration completed successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error during migration: " + e.getMessage());
        }
    }

    @GetMapping("/check")
    public boolean hasUserRated(@RequestParam String productId, Authentication auth) {
        if (auth == null) return false;
        String userId = auth.getName();
        return ratingRepo.findByUserIdAndProductId(userId, productId).isPresent();
    }

    @GetMapping("/user-rating")
    public Rating getUserRating(@RequestParam String productId, Authentication auth) {
        if (auth == null) return null;
        String userId = auth.getName();
        return ratingRepo.findByUserIdAndProductId(userId, productId).orElse(null);
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

        Optional<Rating> existing = ratingRepo.findByUserIdAndProductId(userId, rating.getProductId());
        if (existing.isPresent()) {
            throw new RuntimeException("User has already rated this product");
        }

        rating.setSubmittedAt(LocalDateTime.now());
        Rating savedRating = ratingRepo.save(rating);

        // Update product's ratingList and average rating
        productRepo.findById(rating.getProductId()).ifPresent(product -> {
            // Create rating map
            Map<String, Object> ratingMap = new HashMap<>();
            ratingMap.put("ratingId", savedRating.getId());
            ratingMap.put("score", savedRating.getRating());
            ratingMap.put("userId", userId);
            ratingMap.put("submittedAt", savedRating.getSubmittedAt());

            // Add to ratingList
            if (product.getRatingList() == null) {
                product.setRatingList(new java.util.ArrayList<>());
            }
            product.getRatingList().add(ratingMap);

            // Calculate new average rating
            float avg = (float) product.getRatingList().stream()
                .mapToInt(r -> (int) r.get("score"))
                .average()
                .orElse(0);
            product.setRating(avg);

            // Add comment to reviews if present
            if (rating.getComment() != null && !rating.getComment().isBlank()) {
                if (product.getReview() == null) {
                    product.setReview(new java.util.ArrayList<>());
                }
                product.getReview().add(rating.getComment());
            }

            productRepo.save(product);
        });

        return savedRating;
    }

    @DeleteMapping("/{ratingId}")
    public void deleteRating(@PathVariable String ratingId, Authentication auth) {
        String userId = auth.getName();
        Optional<Rating> rating = ratingRepo.findById(ratingId);
        
        if (rating.isPresent() && rating.get().getUserId().equals(userId)) {
            ratingRepo.deleteById(ratingId);
            
            // Update product's ratingList and recalculate average
            productRepo.findById(rating.get().getProductId()).ifPresent(product -> {
                // Remove from ratingList
                product.getRatingList().removeIf(item -> ratingId.equals(item.get("ratingId")));
                
                // Recalculate average rating
                float avg = (float) product.getRatingList().stream()
                    .mapToInt(r -> (int) r.get("score"))
                    .average()
                    .orElse(0);
                product.setRating(avg);
                
                productRepo.save(product);
            });
        } else {
            throw new RuntimeException("Not authorized to delete this rating");
        }
    }

    @PutMapping("/{ratingId}")
    public Rating updateRating(@PathVariable String ratingId, @RequestBody Rating updatedRating, Authentication auth) {
        String userId = auth.getName();
        Optional<Rating> existingRating = ratingRepo.findById(ratingId);
        
        if (existingRating.isPresent() && existingRating.get().getUserId().equals(userId)) {
            Rating rating = existingRating.get();
            rating.setRating(updatedRating.getRating());
            rating.setComment(updatedRating.getComment());
            rating.setVisible(false); // Reset visibility when edited
            
            Rating savedRating = ratingRepo.save(rating);
            
            // Update product's ratingList and recalculate average
            productRepo.findById(rating.getProductId()).ifPresent(product -> {
                // Update rating in ratingList
                product.getRatingList().stream()
                    .filter(item -> ratingId.equals(item.get("ratingId")))
                    .findFirst()
                    .ifPresent(item -> item.put("score", updatedRating.getRating()));
                
                // Recalculate average rating
                float avg = (float) product.getRatingList().stream()
                    .mapToInt(r -> (int) r.get("score"))
                    .average()
                    .orElse(0);
                product.setRating(avg);
                
                productRepo.save(product);
            });
            
            return savedRating;
        } else {
            throw new RuntimeException("Not authorized to update this rating");
        }
    }

    @GetMapping("/product/{productId}")
    public List<Rating> getRatingsByProduct(@PathVariable String productId) {
        return ratingRepo.findByProductId(productId).stream()
            .filter(rating -> rating.isVisible())
            .collect(Collectors.toList());
    }
}
