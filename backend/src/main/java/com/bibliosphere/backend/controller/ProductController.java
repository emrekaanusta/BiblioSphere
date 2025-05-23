package com.bibliosphere.backend.controller;
import com.bibliosphere.backend.dto.UserProfileDto;
import com.bibliosphere.backend.config.CloudinaryUploadService;
import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.repository.ProductRepository;
import com.bibliosphere.backend.service.ProductService;
import com.bibliosphere.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ProductController {

    private final UserService userService;
    private final CloudinaryUploadService imageService;
    private final ProductRepository       repo;
    private final ProductService          productService;
    private final ProductRepository productRepository;

    /* ---------- GET ---------- */
    /* ---------- GET ---------- */
    @GetMapping
    public List<Product> getAll() {
        List<Product> list = repo.findAll();
        // ensure category is populated on every document
        return list;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMyProfile(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.loadUserByEmail(auth.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Make sure these are typed as List<Product>, not List<?>
        List<Product> wishlist   = userService.loadProducts(user.getWishlist());
        List<Product> shoppingCart = userService.loadProducts(user.getShopping_cart());

        UserProfileDto dto = new UserProfileDto(
                user.getEmail(),
                user.getName(),
                user.getSurname(),
                user.getTaxid(),
                user.getAddress(),
                user.getCity(),
                user.getZipCode(),
                wishlist,
                shoppingCart   // matches the DTO's field name exactly
        );

        return ResponseEntity.ok(dto);
    }


    public Product getProductById(String isbn) {
        Optional<Product> opt = productRepository.findById(isbn);
        return opt.orElse(null);
    }

    @GetMapping("/{isbn}")
    public ResponseEntity<Product> getByIsbn(@PathVariable String isbn) {
        return repo.findById(isbn)
                .map(p -> {
                    if (p.getCategory() == null) {
                        p.setCategory(p.getCategory());
                    }
                    return ResponseEntity.ok(p);
                })
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
        p.setCategory(product.getCategory());
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

    @PutMapping("/{isbn}")
    public ResponseEntity<Product> updateProduct(@PathVariable String isbn, @RequestBody Product updatedProduct) {
        if (!repo.existsById(isbn)) {
            return ResponseEntity.notFound().build();
        }
        
        Product existingProduct = repo.findById(isbn).get();
        
        // Update all fields except ISBN (which is the ID)
        existingProduct.setTitle(updatedProduct.getTitle());
        existingProduct.setAuthor(updatedProduct.getAuthor());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setImage(updatedProduct.getImage());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPublisYear(updatedProduct.getPublisYear());
        existingProduct.setPages(updatedProduct.getPages());
        existingProduct.setStock(updatedProduct.getStock());
        existingProduct.setLanguage(updatedProduct.getLanguage());
        existingProduct.setPublisher(updatedProduct.getPublisher());
        
        Product saved = repo.save(existingProduct);
        return ResponseEntity.ok(saved);
    }

}
