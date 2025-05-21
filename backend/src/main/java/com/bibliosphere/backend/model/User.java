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
    private String username;
    private String password;
    private String name;
    private String surname;
    private String phone;
    private String role;
    private String home_address;
    private String credit_card;
    private List<String> shopping_cart;
    private List<String> orders;
    private List<String> wishlist;
    private String address;
    private String ZipCode;
    private String city;

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
