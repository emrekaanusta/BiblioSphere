package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repo;
    private final MongoTemplate mongo;

    @Override
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    @Override
    public Product getProductById(String id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Override
    public Product createProduct(Product product) {
        return repo.save(product);
    }

    @Override
    public Product updateProduct(String id, Product product) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        product.setId(id);
        return repo.save(product);
    }

    @Override
    public void deleteProduct(String id) {
        repo.deleteById(id);
    }

    @Override
    public List<Product> searchProducts(String query) {
        return repo.findByTitleContainingIgnoreCase(query);
    }

    @Override
    public List<Product> getProductsByCategory(String category) {
        return repo.findByCategory(category);
    }

    public Product decrementStock(String isbn) {
        Query q = Query.query(Criteria.where("_id").is(isbn).and("stock").gt(0));
        Update up = new Update().inc("stock", -1);
        return mongo.findAndModify(
                q, up,
                FindAndModifyOptions.options().returnNew(true),
                Product.class);
    }

    public Product resetStock(String isbn, int qty) {
        Product p = repo.findById(isbn)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        p.setStock(qty);
        return repo.save(p);
    }
} 