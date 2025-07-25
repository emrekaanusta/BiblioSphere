package com.bibliosphere.backend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("categories")
public class Category {
    @Id
    private String id;
    private String name;

    public Category() {}
    public Category(String name) { this.name = name; }
    public String getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
