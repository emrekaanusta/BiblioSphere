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
public class ProductController {

    @Autowired
    private CloudinaryUploadService imageService;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping(path ="/api/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @PostMapping(path ="/api/products/add",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createProduct(
            @RequestParam("file") MultipartFile file,
            @RequestParam("isbn") String isbn,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("type") String type,
            @RequestParam("price") float price,
            @RequestParam("description") String description,
            @RequestParam("publisYear") String publisYear,
            @RequestParam("pages") int pages,
            @RequestParam("language") String language,
            @RequestParam("publisher") String publisher) throws IOException {

        String imageUrl = imageService.uploadImage(file);

        Product product = new Product();
        product.setIsbn(isbn);
        product.setTitle(title);
        product.setAuthor(author);
        product.setType(type);
        product.setPrice(price);
        product.setDescription(description);
        product.setPublisYear(publisYear);
        product.setPages(pages);
        product.setLanguage(language);
        product.setPublisher(publisher);
        product.setImage(imageUrl);

        return ResponseEntity.ok(productRepository.save(product));
    }
}
