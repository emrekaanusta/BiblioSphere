package com.bibliosphere.backend.repository;

import com.bibliosphere.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    List<User> findByWishlistContaining(String productId);
}

