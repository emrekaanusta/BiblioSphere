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
@Document(collection = "wishlist_clusters")
public class WishlistCluster {
    @Id
    private String id;
    private String userEmail;
    private String name;
    private String surname;
    private List<String> wishlist = new ArrayList<>();
    private String address = "";
    private String zipCode = "";
    private String city = "";
} 