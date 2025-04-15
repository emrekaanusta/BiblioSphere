package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.config.CloudinaryUploadService;
import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private CloudinaryUploadService imageService; // If using Cloudinary

    @Autowired
    private ProductRepository productRepository;

    /**
     * GET all products
     * URL: http://localhost:8080/api/products
     */
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * GET a product by ISBN
     * Example: http://localhost:8080/api/products/1
     */
    @GetMapping("/{isbn}")
    public ResponseEntity<Product> getProductByIsbn(@PathVariable String isbn) {
        return productRepository.findById(isbn)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST a new product with file upload
     * Example: POST http://localhost:8080/api/products
     * (multipart form data)
     */
    @PostMapping(path="/add",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createProduct(
            @RequestParam("file") MultipartFile file,
            @RequestParam("isbn") String isbn,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("type") String type,
            @RequestParam("stock")  int stock,
            @RequestParam("price") float price,
            @RequestParam("description") String description,
            @RequestParam("publisYear") String publisYear,
            @RequestParam("pages") int pages,
            @RequestParam("language") String language,
            @RequestParam("publisher") String publisher
    ) throws IOException {

        String imageUrl = imageService.uploadImage(file);

        Product product = new Product();
        product.setIsbn(isbn);
        product.setTitle(title);
        product.setAuthor(author);
        product.setType(type);
        product.setStock(stock);
        product.setPrice(price);
        product.setDescription(description);
        product.setPublisYear(publisYear);
        product.setPages(pages);
        product.setLanguage(language);
        product.setPublisher(publisher);
        product.setImage(imageUrl);

        Product savedProduct = productRepository.save(product);
        return ResponseEntity.ok(savedProduct);
    }
}
