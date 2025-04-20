package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.*;
import com.bibliosphere.backend.repository.OrderRepository;
import com.bibliosphere.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final UserRepository  userRepo;
    private final EmailService emailService;  // ✅ Inject email service

    public Order createOrder(Order order) {
        Order saved = orderRepo.save(order);

        userRepo.findById(order.getUserEmail()).ifPresent(u -> {
            u.getOrders().add(saved.getId());
            userRepo.save(u);
        });

        emailService.sendOrderReceipt(saved);  // ✅ Send email
        return saved;
    }

    public List<Order> getOrdersForUser(String email) {
        return orderRepo.findAllByUserEmailOrderByCreatedAtDesc(email);
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepo.findById(id); // ✅ matches the injected field
    }
}
