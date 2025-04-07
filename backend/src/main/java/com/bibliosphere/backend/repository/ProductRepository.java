package com.bibliosphere.backend.repository;

import com.bibliosphere.backend.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

// 2nd param is the type of the ID field, i.e. String for "isbn"
public interface ProductRepository extends MongoRepository<Product, String> {
    // Additional query methods can go here if you need them
}
