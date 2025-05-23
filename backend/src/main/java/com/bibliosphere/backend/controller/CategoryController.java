package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.Category;
import com.bibliosphere.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    @Autowired private CategoryService svc;

    @GetMapping
    public List<Category> all() {
        return svc.findAll();
    }

    @PostMapping
    public ResponseEntity<Category> create(@RequestBody Category c) {
        if (c.getName() == null || c.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return ResponseEntity.ok(svc.add(c.getName().trim()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            svc.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}