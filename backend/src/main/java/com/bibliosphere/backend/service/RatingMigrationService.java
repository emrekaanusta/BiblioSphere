package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.model.Rating;
import com.bibliosphere.backend.repository.ProductRepository;
import com.bibliosphere.backend.repository.RatingRepository;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.UpdateOptions;
import com.mongodb.client.model.Updates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingMigrationService {

    private final RatingRepository ratingRepo;
    private final MongoClient mongoClient;

    private String extractEmailFromUserString(String userString) {
        if (userString == null) {
            return null;
        }
        Pattern pattern = Pattern.compile("email=([^,]+)");
        Matcher matcher = pattern.matcher(userString);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return userString;
    }

    @Transactional
    public void migrateRatings() {
        log.info("Starting rating migration process using native MongoDB driver...");
        
        MongoDatabase database = mongoClient.getDatabase("main");
        MongoCollection<Document> productsCollection = database.getCollection("products");
        MongoCollection<Document> ratingsCollection = database.getCollection("ratings");
        
        List<Document> ratingsByProduct = ratingsCollection.aggregate(List.of(
            new Document("$group", 
                new Document("_id", "$productId")
                    .append("ratings", new Document("$push", "$$ROOT"))
            )
        )).into(new ArrayList<>());
        
        log.info("Found {} products with ratings", ratingsByProduct.size());
        int totalRatingsMigrated = 0;
        
        for (Document productRatings : ratingsByProduct) {
            String productId = productRatings.getString("_id");
            if (productId == null) {
                log.warn("Skipping rating with null productId");
                continue;
            }

            List<Document> ratings = (List<Document>) productRatings.get("ratings");
            if (ratings == null || ratings.isEmpty()) {
                continue;
            }

            List<Document> ratingList = new ArrayList<>();
            float totalScore = 0;
            
            for (Document rating : ratings) {
                if (rating == null) {
                    continue;
                }

                Document ratingItem = new Document()
                    .append("ratingId", rating.getObjectId("_id") != null ? rating.getObjectId("_id").toString() : null)
                    .append("score", rating.getInteger("rating", 0))
                    .append("userId", extractEmailFromUserString(rating.getString("userId")))
                    .append("submittedAt", rating.getDate("submittedAt"));
                
                ratingList.add(ratingItem);
                totalScore += rating.getInteger("rating", 0);
                totalRatingsMigrated++;
            }
            
            if (!ratingList.isEmpty()) {
                float averageRating = totalScore / ratingList.size();
                
                Bson filter = eq("_id", productId);
                Bson update = combine(
                    set("ratingList", ratingList),
                    set("rating", averageRating)
                );
                
                try {
                    productsCollection.updateOne(filter, update, new UpdateOptions().upsert(false));
                    log.info("Updated product {} with {} ratings", productId, ratingList.size());
                } catch (Exception e) {
                    log.error("Error updating product {}: {}", productId, e.getMessage());
                }
            }
        }
        
        log.info("Migration completed. Total ratings migrated: {}", totalRatingsMigrated);
        
        long productsWithRatings = productsCollection.countDocuments(
            new Document("ratingList", new Document("$exists", true).append("$ne", new ArrayList<>()))
        );
        log.info("Verification: Found {} products with ratingList", productsWithRatings);
    }
} 