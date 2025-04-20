package com.bibliosphere.backend.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class OrderItem {
    private String productId;
    private String title;
    private double price;
    private int quantity;
    private String image;
}