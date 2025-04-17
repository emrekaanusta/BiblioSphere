package com.bibliosphere.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String email;
    private String password;
    private String name;
    private String surname;
    private String phone;
    private String role;
    private String home_address;
    private String credit_card;
    private List<Product> shopping_cart;
    private List<Order> orders;
    private List<Product> wishlist;
}
