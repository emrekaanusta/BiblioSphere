// src/main/java/com/bibliosphere/backend/dto/UserProfileDto.java
package com.bibliosphere.backend.dto;

import com.bibliosphere.backend.model.Product;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class UserProfileDto {
    private String email;
    private String name;
    private String surname;
    private String taxid;
    private String address;
    private String city;
    private String zipCode;
    private List<Product> wishlist;
    private List<Product> shoppingCart;
}
