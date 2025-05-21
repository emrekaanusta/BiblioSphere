package com.bibliosphere.backend.controller;
import org.springframework.web.bind.annotation.RequestMethod;

import com.bibliosphere.backend.model.Order;
import com.bibliosphere.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.bibliosphere.backend.model.OrderStatus;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(                       // 👈  allow React dev‑server
        origins = "http://localhost:3000",
        methods = {                 //    and include PATCH pre‑flight
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PATCH
        })
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /* ---------- place order ---------- */
    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody Order order, Authentication auth) {
        order.setUserEmail(auth.getName());
        return ResponseEntity.status(201).body(orderService.createOrder(order));
    }

    /* ---------- cancel order ---------- */
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancel(@PathVariable String orderId, Authentication auth) {
        try {
            Order cancelled = orderService.cancelOrder(orderId, auth.getName());
            return ResponseEntity.ok(cancelled);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(null); // refine as needed
        }
    }

    /* ---------- fetch one ---------- */
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable String orderId, Authentication auth) {
        Optional<Order> opt = orderService.getOrderById(orderId);
        if (opt.isPresent() && opt.get().getUserEmail().equals(auth.getName()))
            return ResponseEntity.ok(opt.get());
        return ResponseEntity.status(403).build();
    }

    /* ---------- list my orders ---------- */
    @GetMapping
    public List<Order> myOrders(Authentication auth) {
        return orderService.getOrdersForUser(auth.getName());
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable String orderId, @RequestBody StatusUpdateRequest request) {
        try {
            OrderStatus newStatus = OrderStatus.valueOf(request.getStatus());
            Order updated = orderService.updateOrderStatus(orderId, newStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build(); // invalid status
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build(); // order not found
        }
    }

    // DTO for status update
    public static class StatusUpdateRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
