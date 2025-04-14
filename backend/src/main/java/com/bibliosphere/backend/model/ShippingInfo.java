package com.bibliosphere.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class ShippingInfo {
    private String firstName;
    private String lastName;
    private String email;
    private String address;
    private String city;
    private String zipCode;
}