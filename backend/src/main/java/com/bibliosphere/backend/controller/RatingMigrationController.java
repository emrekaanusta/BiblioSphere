package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.service.RatingMigrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/migration")
public class RatingMigrationController {

    private final RatingMigrationService migrationService;

    public RatingMigrationController(RatingMigrationService migrationService) {
        this.migrationService = migrationService;
    }

    @PostMapping("/ratings")
    public ResponseEntity<String> migrateRatings() {
        try {
            migrationService.migrateRatings();
            return ResponseEntity.ok("Rating migration completed successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error during migration: " + e.getMessage());
        }
    }
} 