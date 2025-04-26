package com.bibliosphere.backend;

import com.bibliosphere.backend.service.RatingMigrationService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RatingMigrationRunner implements CommandLineRunner {

    private final RatingMigrationService migrationService;

    public RatingMigrationRunner(RatingMigrationService migrationService) {
        this.migrationService = migrationService;
    }

    @Override
    public void run(String... args) {
        try {
            System.out.println("Starting rating migration...");
            migrationService.migrateRatings();
            System.out.println("Rating migration completed successfully!");
        } catch (Exception e) {
            System.err.println("Error during rating migration: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 