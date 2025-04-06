package com.bibliosphere.backend.repository;

import com.bibliosphere.backend.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findAllByUserEmailOrderByCreatedAtDesc(String userEmail);
}