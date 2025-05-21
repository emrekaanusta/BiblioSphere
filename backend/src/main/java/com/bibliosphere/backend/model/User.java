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
@Document(collection = "users")
public class User {

    @Id
    private String email;
    private String username;
    private String password;
    private String name;
    private String surname;
    private String taxid = "";  // Initialize as empty string
    private String role = "customer";  // Default to customer
    private List<String> shopping_cart = new ArrayList<>();  // Initialize as empty list
    private List<String> orders = new ArrayList<>();  // Initialize as empty list
    private List<String> wishlist = new ArrayList<>();  // Initialize as empty list
    private String address = "";  // Initialize as empty string
    private String ZipCode = "";  // Initialize as empty string
    private String city = "";  // Initialize as empty string

    // Constructor for registration
    public User(String email, String username, String password, String name, String surname) {
        this.email = email;
        this.username = username;
        this.password = password;
        this.name = name;
        this.surname = surname;
        this.role = "customer";
        this.shopping_cart = new ArrayList<>();
        this.orders = new ArrayList<>();
        this.wishlist = new ArrayList<>();
        this.taxid = "";
        this.address = "";
        this.ZipCode = "";
        this.city = "";
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
