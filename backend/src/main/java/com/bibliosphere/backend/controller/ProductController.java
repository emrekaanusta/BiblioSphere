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
    @PatchMapping("/products/{id}/price")
    public ResponseEntity<?> updatePrice(@PathVariable String id, @RequestBody Map<String, Float> payload) {
        float newPrice = payload.get("price");
        Product product = productRepository.findById(id).orElseThrow();
        product.setPrice(newPrice);
        productRepository.save(product);
        return ResponseEntity.ok(product);
    }


    /* ---------- POST (create) ---------- */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createProduct(
            @RequestParam("file")        MultipartFile file,
            @RequestParam("isbn")        String isbn,
            @RequestParam("title")       String title,
            @RequestParam("author")      String author,
            @RequestParam("type")        String type,
            @RequestParam("price")       float  price,
            @RequestParam("stock")       int    stock,
            @RequestParam("description") String description,
            @RequestParam("publisYear")  String publisYear,
            @RequestParam("pages")       int    pages,
            @RequestParam("language")    String language,
            @RequestParam("publisher")   String publisher
    ) throws IOException {

        String imageUrl = imageService.uploadImage(file);

        // ⚠  order follows the field order in Product.java
        Product p = new Product(
                isbn, title, author, type, price,
                imageUrl,                        
                description, publisYear, pages,
                stock,                           
                language, publisher,
                0f,                              
                new ArrayList<>(),             
                new ArrayList<>());             

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
