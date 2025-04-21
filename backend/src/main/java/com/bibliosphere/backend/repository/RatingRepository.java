package com.bibliosphere.backend.repository;

import com.bibliosphere.backend.model.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends MongoRepository<Rating, String> {
    Optional<Rating> findByUserIdAndProductId(String userId, String productId);
    List<Rating> findByProductId(String productId);
    Page<Rating> findByProductId(String productId, Pageable pageable);
}
