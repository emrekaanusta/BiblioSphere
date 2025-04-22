package com.bibliosphere.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ratings")
public class Rating {

    @Id
    private String id;

    private String productId;
    private String userId;

    private int rating; // 1 to 5
    private String comment; // optional

    private String orderId; // optional, helps trace source
    private LocalDateTime submittedAt;
}
