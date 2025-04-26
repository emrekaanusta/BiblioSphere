package com.bibliosphere.backend.service;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;
    private final MongoTemplate     mongo;

    /** Atomically decrement stock (-1) **only if** current stock > 0. */
    public Product decrementStock(String isbn) {
        Query  q  = Query.query(Criteria.where("_id").is(isbn).and("stock").gt(0));
        Update up = new Update().inc("stock", -1);

        return mongo.findAndModify(
                q, up,
                FindAndModifyOptions.options().returnNew(true),
                Product.class);
    }

    /** Helper to reset stock to a specific quantity (dev/testing). */
    public Product resetStock(String isbn, int qty) {
        Product p = repo.findById(isbn)
                        .orElseThrow(() -> new RuntimeException("Product not found"));
        p.setStock(qty);
        return repo.save(p);
    }
}
