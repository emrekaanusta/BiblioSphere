package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.config.CloudinaryUploadService;
import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.repository.ProductRepository;
import com.bibliosphere.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ProductController {

    private final CloudinaryUploadService imageService;
    private final ProductRepository       repo;
    private final ProductService          productService;
    private final ProductRepository productRepository;

    /* ---------- GET ---------- */
    @GetMapping
    public List<Product> getAll() {
        return repo.findAll();
    }

    @GetMapping("/{isbn}")
    public ResponseEntity<Product> getByIsbn(@PathVariable String isbn) {
        return repo.findById(isbn)
                   .map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{isbn}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String isbn) {
        if (!repo.existsById(isbn)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(isbn);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}/price")
    public ResponseEntity<Product> updatePrice(@PathVariable String id, @RequestBody Double newPrice) {
        Product product = repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        product.setPrice(newPrice);
        return ResponseEntity.ok(repo.save(product));
    }


    /* ---------- POST (create) ---------- */
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product p = new Product();
        p.setIsbn(product.getIsbn());
        p.setTitle(product.getTitle());
        p.setAuthor(product.getAuthor());
        p.setType(product.getType());
        p.setPrice(product.getPrice());
        p.setImage(product.getImage());
        p.setDescription(product.getDescription());
        p.setPublisYear(product.getPublisYear());
        p.setPages(product.getPages());
        p.setStock(product.getStock());
        p.setLanguage(product.getLanguage());
        p.setPublisher(product.getPublisher());
        p.setRating(product.getRating());
        p.setReview(new ArrayList<>());
        p.setRatingList(new ArrayList<>());
        return ResponseEntity.ok(repo.save(p));
    }

    /* ---------- PATCH: decrement stock ---------- */
    @PatchMapping("/{isbn}/decrement")
    public ResponseEntity<Product> decrement(@PathVariable String isbn) {
        Product updated = productService.decrementStock(isbn);
        if (updated == null) return ResponseEntity.badRequest().build(); // already 0
        return ResponseEntity.ok(updated);
    }

    /* ---------- PATCH: reset stock (dev only) ---------- */
    @PatchMapping("/{isbn}/reset/{qty}")
    public ResponseEntity<Product> reset(@PathVariable String isbn,
                                         @PathVariable int qty) {
        return ResponseEntity.ok(productService.resetStock(isbn, qty));
    }
}
