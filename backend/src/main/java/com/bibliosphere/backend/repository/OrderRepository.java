package com.bibliosphere.backend.repository;

import com.bibliosphere.backend.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findAllByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}