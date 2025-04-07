package com.bibliosphere.backend.repository;
import com.bibliosphere.backend.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, String> {
}
