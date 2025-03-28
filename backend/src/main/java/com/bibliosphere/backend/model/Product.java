package com.bibliosphere.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    private String isbn;
    private String title;
    private String author;
    private String type;
    private float  price;
    private String image;
    private String description;
    private String publisYear;
    private int pages;
    private String language;
    private String publisher;
}
