package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.*;
import com.bibliosphere.backend.repository.OrderRepository;
import com.bibliosphere.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final UserRepository  userRepo;

    /** Create order, save it, and push id into user's orders list */
    public Order createOrder(Order order) {
        Order saved = orderRepo.save(order);

        userRepo.findById(order.getUserEmail()).ifPresent(u -> {
            u.getOrders().add(saved.getId());
            userRepo.save(u);
        });
        return saved;
    }

    public List<Order> getOrdersForUser(String email) {
        return orderRepo.findAllByUserEmailOrderByCreatedAtDesc(email);
    }
}
