package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.Order;
import com.bibliosphere.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// OrderController.java  (the single source of truth)
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody Order order,
                                            Authentication auth) {
        order.setUserEmail(auth.getName());
        return ResponseEntity.status(201)
                .body(orderService.createOrder(order));
    }

    @GetMapping
    public List<Order> myOrders(Authentication auth) {
        return orderService.getOrdersForUser(auth.getName());
    }
}
