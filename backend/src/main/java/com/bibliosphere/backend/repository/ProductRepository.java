package com.bibliosphere.backend.repository;

import com.bibliosphere.backend.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// 2nd param is the type of the ID field, i.e. String for "isbn"
@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByTitleContainingIgnoreCase(String title);
    List<Product> findByCategory(String category);
}
