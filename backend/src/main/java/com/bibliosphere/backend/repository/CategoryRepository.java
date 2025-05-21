package com.bibliosphere.backend.repository;

import com.bibliosphere.backend.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CategoryRepository extends MongoRepository<Category,String> {
    boolean existsByName(String name);
}