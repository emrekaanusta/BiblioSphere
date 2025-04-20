package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.Order;
import com.bibliosphere.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Place a new order
    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody Order order, Authentication auth) {
        order.setUserEmail(auth.getName()); // associate order with the authenticated user
        return ResponseEntity.status(201)
                .body(orderService.createOrder(order));
    }

    // Get specific order by ID (only if it belongs to the authenticated user)
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable String orderId, Authentication auth) {
        Optional<Order> orderOpt = orderService.getOrderById(orderId);

        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();

            // ✅ Ensure only the user who placed the order can see it
            if (!order.getUserEmail().equals(auth.getName())) {
                return ResponseEntity.status(403).build(); // Forbidden
            }

            return ResponseEntity.ok(order);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get all orders for the logged-in user
    @GetMapping
    public List<Order> myOrders(Authentication auth) {
        return orderService.getOrdersForUser(auth.getName());
    }
}
