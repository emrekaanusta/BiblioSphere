package com.bibliosphere.backend.config;

import com.bibliosphere.backend.model.Category;
import com.bibliosphere.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        // Only add categories if none exist
        if (categoryRepository.count() == 0) {
            List<String> defaultCategories = Arrays.asList(
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

            defaultCategories.forEach(categoryName -> {
                if (!categoryRepository.existsByName(categoryName)) {
                    categoryRepository.save(new Category(categoryName));
                }
            });
        }
    }
} 