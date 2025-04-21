package com.bibliosphere.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products") // Make sure this matches your actual collection name
public class Product {

    @Id
    private String isbn;      // Using ISBN as the primary key (_id)
    private String title;
    private String author;
    private String type;
    private float price;
    private String image;
    private String description;
    private String publisYear;
    private int pages;
    private int    stock;
    private String language;
    private String publisher;
    private float rating;
    private List<String> review = new ArrayList<>();
}
