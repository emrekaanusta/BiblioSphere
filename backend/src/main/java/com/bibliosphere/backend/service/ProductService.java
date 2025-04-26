package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.Product;
import java.util.List;

public interface ProductService {
    List<Product> getAllProducts();
    Product getProductById(String id);
    Product createProduct(Product product);
    Product updateProduct(String id, Product product);
    void deleteProduct(String id);
    List<Product> searchProducts(String query);
    List<Product> getProductsByCategory(String category);
}
