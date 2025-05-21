package com.bibliosphere.backend.config;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductFieldMigrationRunner implements CommandLineRunner {
    private final MongoTemplate mongo;

    public ProductFieldMigrationRunner(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    @Override
    public void run(String... args) {
        MongoDatabase db = mongo.getDb();
        MongoCollection<Document> products = db.getCollection("products");

        // 1) Copy "type" → "category"
        products.updateMany(
                new Document(),
                List.of(new Document("$set", new Document("category", "$type")))
        );

        // 2) (optional) remove the old "type" field
        products.updateMany(
                new Document(),
                new Document("$unset", new Document("type", ""))
        );

        System.out.println("🗄️  ProductFieldMigrationRunner finished");
    }
}
