package com.bibliosphere.backend.config;

import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.model.Category;
import com.bibliosphere.backend.repository.ProductRepository;
import com.bibliosphere.backend.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CategorySeeder implements CommandLineRunner {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;

    private final Set<String> defaultCategories = Set.of(
        "Fiction",
        "Non-Fiction",
        "Science Fiction",
        "Mystery",
        "Romance",
        "Biography",
        "History",
        "Science",
        "Technology",
        "Self-Help"
    );

    public CategorySeeder(ProductRepository productRepo,
                          CategoryRepository categoryRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1) Add default categories if none exist
        if (categoryRepo.count() == 0) {
            defaultCategories.forEach(name -> {
                Category c = new Category();
                c.setName(name);
                categoryRepo.save(c);
            });
            System.out.println("✅ Seeded default categories: " + defaultCategories);
        }

        // 2) Pull every distinct category out of your products
        Set<String> productCategories = productRepo.findAll().stream()
                .map(Product::getCategory)
                .filter(c -> c != null && !c.isBlank())
                .collect(Collectors.toSet());

        // 3) For each product category name, insert if it doesn't already exist
        for (String name : productCategories) {
            if (!categoryRepo.existsByName(name)) {
                Category c = new Category();
                c.setName(name);
                categoryRepo.save(c);
            }
        }

        if (!productCategories.isEmpty()) {
            System.out.println("✅ Added product categories: " + productCategories);
        }
    }
}
