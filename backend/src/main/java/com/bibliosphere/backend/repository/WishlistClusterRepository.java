package com.bibliosphere.backend.repository;

import com.bibliosphere.backend.model.WishlistCluster;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface WishlistClusterRepository extends MongoRepository<WishlistCluster, String> {
    Optional<WishlistCluster> findByUserEmail(String userEmail);
} 