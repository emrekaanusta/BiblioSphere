package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.Category;
import com.bibliosphere.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    @Autowired private CategoryRepository repo;

    public List<Category> findAll() {
        return repo.findAll();
    }

    public Category add(String name) {
        if (repo.existsByName(name)) {
            throw new IllegalArgumentException("Category already exists");
        }
        return repo.save(new Category(name));
    }

    public void deleteById(String id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Category not found");
        }
        repo.deleteById(id);
    }


}
