package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.Rating;
import com.bibliosphere.backend.repository.RatingRepository;
import com.bibliosphere.backend.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Controller for handling product ratings and reviews.
 * Provides endpoints for checking, submitting, retrieving, and deleting ratings.
 */
@RestController
@RequestMapping("/api/ratings")
@Validated
public class RatingController {

    private final RatingRepository ratingRepo;
    private final ProductRepository productRepo;
    private static final int MAX_COMMENT_LENGTH = 1000;
    private static final int MIN_COMMENT_LENGTH = 10;

    public RatingController(RatingRepository ratingRepo, ProductRepository productRepo) {
        this.ratingRepo = ratingRepo;
        this.productRepo = productRepo;
    }

    /**
     * Submits a new rating for a product.
     *
     * @param ratingRequest The rating request containing the rating value and optional comment
     * @param auth The authentication object containing user information
     * @return The saved rating object
     * @throws ResponseStatusException if the user has already rated the product
     */
    @PostMapping
    public ResponseEntity<Rating> submitRating(
            @RequestBody RatingRequest ratingRequest,
            Authentication auth) {
        try {
            // Validate rating value
            if (ratingRequest.getRating() < 1 || ratingRequest.getRating() > 5) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rating must be between 1 and 5"
                );
            }

            // Validate comment length
            if (ratingRequest.getComment() != null && 
                (ratingRequest.getComment().length() < MIN_COMMENT_LENGTH || 
                 ratingRequest.getComment().length() > MAX_COMMENT_LENGTH)) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Comment must be between " + MIN_COMMENT_LENGTH + " and " + MAX_COMMENT_LENGTH + " characters"
                );
            }

            String userId = auth.getName();
            String productId = ratingRequest.getProductId();

            // Check if product exists
            if (!productRepo.existsById(productId)) {
                throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
                );
            }

            // Check if user has already rated
            if (ratingRepo.findByUserIdAndProductId(userId, productId).isPresent()) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already rated this product"
                );
            }

            Rating rating = new Rating();
            rating.setUserId(userId);
            rating.setProductId(productId);
            rating.setRating(ratingRequest.getRating());
            rating.setComment(ratingRequest.getComment());
            rating.setSubmittedAt(LocalDateTime.now());

            // Analyze sentiment if comment exists
            if (rating.getComment() != null) {
                rating.setSentiment(analyzeSentiment(rating.getComment()));
            }

            Rating savedRating = ratingRepo.save(rating);
            updateProductRating(productId);

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedRating);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error submitting rating: " + e.getMessage()
            );
        }
    }

    /**
     * Retrieves paginated ratings for a specific product.
     *
     * @param productId The ID of the product
     * @param page The page number
     * @param size The page size
     * @param sortBy The field to sort by
     * @param direction The sort direction
     * @param minRating The minimum rating to filter by
     * @param maxRating The maximum rating to filter by
     * @param hasComment Whether to filter by comments
     * @param commentContains The comment content to filter by
     * @param minCommentLength The minimum comment length to filter by
     * @param maxCommentLength The maximum comment length to filter by
     * @param sentiment The sentiment to filter by
     * @return Page of ratings for the product
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<Rating>> getRatingsByProduct(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating,
            @RequestParam(required = false) Boolean hasComment,
            @RequestParam(required = false) String commentContains,
            @RequestParam(required = false) Integer minCommentLength,
            @RequestParam(required = false) Integer maxCommentLength,
            @RequestParam(required = false) String sentiment) {
        try {
            // Validate product exists
            if (!productRepo.existsById(productId)) {
                throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
                );
            }

            // Create page request with sorting
            Sort.Direction sortDirection = Sort.Direction.fromString(direction);
            PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

            // Get paginated ratings
            Page<Rating> ratings = ratingRepo.findByProductId(productId, pageRequest);

            // Apply filters
            List<Rating> filteredContent = ratings.getContent().stream()
                .filter(rating -> minRating == null || rating.getRating() >= minRating)
                .filter(rating -> maxRating == null || rating.getRating() <= maxRating)
                .filter(rating -> hasComment == null || (hasComment ? rating.getComment() != null : rating.getComment() == null))
                .filter(rating -> commentContains == null || 
                    (rating.getComment() != null && rating.getComment().toLowerCase().contains(commentContains.toLowerCase())))
                .filter(rating -> minCommentLength == null || 
                    (rating.getComment() != null && rating.getComment().length() >= minCommentLength))
                .filter(rating -> maxCommentLength == null || 
                    (rating.getComment() != null && rating.getComment().length() <= maxCommentLength))
                .filter(rating -> sentiment == null || 
                    (rating.getSentiment() != null && rating.getSentiment().equalsIgnoreCase(sentiment)))
                .collect(Collectors.toList());

            // Create new page with filtered content
            Page<Rating> filteredPage = new org.springframework.data.domain.PageImpl<>(
                filteredContent,
                pageRequest,
                filteredContent.size()
            );

            return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(1, TimeUnit.MINUTES))
                .body(filteredPage);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error retrieving ratings: " + e.getMessage()
            );
        }
    }

    /**
     * Retrieves rating statistics for a specific product.
     *
     * @param productId The ID of the product
     * @return Rating statistics for the product
     */
    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<RatingStats> getRatingStats(@PathVariable String productId) {
        try {
            // Validate product exists
            if (!productRepo.existsById(productId)) {
                throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
                );
            }

            List<Rating> ratings = ratingRepo.findByProductId(productId);
            
            RatingStats stats = new RatingStats();
            stats.setTotalRatings(ratings.size());
            stats.setAverageRating(ratings.stream()
                .mapToInt(Rating::getRating)
                .average()
                .orElse(0));
            
            stats.setRatingDistribution(ratings.stream()
                .collect(Collectors.groupingBy(
                    Rating::getRating,
                    Collectors.counting()
                )));

            // Calculate sentiment distribution
            stats.setSentimentDistribution(ratings.stream()
                .filter(rating -> rating.getSentiment() != null)
                .collect(Collectors.groupingBy(
                    Rating::getSentiment,
                    Collectors.counting()
                )));

            return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
                .body(stats);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error retrieving rating statistics: " + e.getMessage()
            );
        }
    }

    /**
     * Deletes a user's rating for a product.
     *
     * @param productId The ID of the product
     * @param auth The authentication object containing user information
     * @return No content response if successful
     */
    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> deleteRating(
            @PathVariable String productId,
            Authentication auth) {
        try {
            String userId = auth.getName();
            
            Optional<Rating> rating = ratingRepo.findByUserIdAndProductId(userId, productId);
            if (rating.isEmpty()) {
                throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Rating not found"
                );
            }

            ratingRepo.delete(rating.get());
            updateProductRating(productId);

            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error deleting rating: " + e.getMessage()
            );
        }
    }

    private void updateProductRating(String productId) {
        List<Rating> ratings = ratingRepo.findByProductId(productId);
        float averageRating = (float) ratings.stream()
            .mapToInt(Rating::getRating)
            .average()
            .orElse(0);

        productRepo.findById(productId).ifPresent(product -> {
            product.setRating(averageRating);
            productRepo.save(product);
        });
    }

    private String analyzeSentiment(String comment) {
        // Simple sentiment analysis based on keywords
        String lowerComment = comment.toLowerCase();
        int positiveWords = countWords(lowerComment, Arrays.asList(
            "great", "excellent", "amazing", "love", "perfect", "wonderful",
            "good", "awesome", "fantastic", "brilliant", "outstanding"
        ));
        int negativeWords = countWords(lowerComment, Arrays.asList(
            "bad", "terrible", "awful", "hate", "poor", "disappointed",
            "worst", "horrible", "dislike", "unhappy", "frustrated"
        ));
        
        if (positiveWords > negativeWords) return "POSITIVE";
        if (negativeWords > positiveWords) return "NEGATIVE";
        return "NEUTRAL";
    }

    private int countWords(String text, List<String> words) {
        return (int) words.stream()
            .filter(text::contains)
            .count();
    }

    /**
     * Request DTO for submitting ratings
     */
    @Validated
    public static class RatingRequest {
        private String productId;
        private int rating;
        private String comment;

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public int getRating() { return rating; }
        public void setRating(int rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class RatingStats {
        private int totalRatings;
        private double averageRating;
        private Map<Integer, Long> ratingDistribution;
        private Map<String, Long> sentimentDistribution;

        // Getters and setters
        public int getTotalRatings() { return totalRatings; }
        public void setTotalRatings(int totalRatings) { this.totalRatings = totalRatings; }
        public double getAverageRating() { return averageRating; }
        public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
        public Map<Integer, Long> getRatingDistribution() { return ratingDistribution; }
        public void setRatingDistribution(Map<Integer, Long> ratingDistribution) { 
            this.ratingDistribution = ratingDistribution; 
        }
        public Map<String, Long> getSentimentDistribution() { return sentimentDistribution; }
        public void setSentimentDistribution(Map<String, Long> sentimentDistribution) { 
            this.sentimentDistribution = sentimentDistribution; 
        }
    }
}
