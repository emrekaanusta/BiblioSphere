package com.bibliosphere.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String isbn;       // Using ISBN as the primary key (_id)

    private String title;
    private String author;

    @Field("category")
    private String category;




    private float price;
    private String image;
    private String description;
    private String publisYear;
    private int pages;
    private int stock;
    private String language;
    private String publisher;
    private float rating;
    private List<String> review = new ArrayList<>();
    private List<Map<String, Object>> ratingList = new ArrayList<>();
    private Double discountPercentage;
    private Double discountedPrice;

    // Helper method to get rating count
    public int getRatingCount() {
        return ratingList != null ? ratingList.size() : 0;
    }

    // Helper method to get average rating
    public float getAverageRating() {
        if (ratingList == null || ratingList.isEmpty()) {
            return 0;
        }
        return (float) ratingList.stream()
                .mapToInt(r -> (int) r.get("score"))
                .average()
                .orElse(0);
    }

    // Price setter for Double
    public void setPrice(Double price) {
        if (price != null) {
            this.price = price.floatValue();
        }
    }

    // Price setter for float
    public void setPrice(float price) {
        this.price = price;
    }

    public float getPrice() {
        return this.price;
    }

    public Double getDiscountPercentage() {
        return discountPercentage != null ? discountPercentage : 0.0;
    }

    public void setDiscountPercentage(Double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public Double getDiscountedPrice() {
        return discountedPrice != null ? discountedPrice : (double) price;
    }

    public void setDiscountedPrice(Double discountedPrice) {
        this.discountedPrice = discountedPrice;
    }
}
