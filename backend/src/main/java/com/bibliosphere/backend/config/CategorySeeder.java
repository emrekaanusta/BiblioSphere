package com.bibliosphere.backend.config;

import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.model.Category;
import com.bibliosphere.backend.repository.ProductRepository;
import com.bibliosphere.backend.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CategorySeeder implements CommandLineRunner {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;

    public CategorySeeder(ProductRepository productRepo,
                          CategoryRepository categoryRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1) Pull every distinct category out of your products
        Set<String> cats = productRepo.findAll().stream()
                .map(Product::getCategory)
                .filter(c -> c != null && !c.isBlank())
                .collect(Collectors.toSet());

        // 2) For each category name, insert if it doesn't already exist
        for (String name : cats) {
            if (!categoryRepo.existsByName(name)) {
                Category c = new Category();    // no-arg constructor
                c.setName(name);                // set the name
                categoryRepo.save(c);
            }
        }

        System.out.println("✅ Seeded categories: " + cats);
    }
}
