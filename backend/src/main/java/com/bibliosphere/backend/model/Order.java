package com.bibliosphere.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private String id;
    private String userEmail;          // who placed it
    private List<OrderItem> items;     // books purchased
    private ShippingInfo shippingInfo; // name & address
    private String shippingMethod;     // standard | express
    private double subtotal;
    private double shippingCost;
    private double total;
    private OrderStatus status = OrderStatus.PROCESSED;
    private Instant createdAt = Instant.now();
}