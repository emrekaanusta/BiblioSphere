package com.bibliosphere.backend.controller;
import org.springframework.web.bind.annotation.RequestMethod;

import com.bibliosphere.backend.model.Order;
import com.bibliosphere.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;

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
    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders(); // sadece PM için kullanılmalı
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable String orderId,
                                              @RequestBody Map<String, String> body,
                                              Authentication auth) {
        String newStatus = body.get("status");
        Order updated = orderService.updateOrderStatus(orderId, newStatus, auth.getName());
        return ResponseEntity.ok(updated);
    }
    @GetMapping("/refunds/pending")
    public List<Order> getPendingRefundsForSalesManager() {
        return orderService.getPendingRefunds();
    }
    @PatchMapping("/refunds/{orderId}")
    public ResponseEntity<?> processRefundDecision(@PathVariable String orderId,
                                                   @RequestParam String action) {
        try {
            Order updated = orderService.handleRefund(orderId, action);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
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

    /* ---------- refund order ---------- */
    @PatchMapping("/{orderId}/refund")
    public ResponseEntity<Order> refund(@PathVariable String orderId, Authentication auth) {
        try {
            Order refunded = orderService.refundOrder(orderId, auth.getName());
            return ResponseEntity.ok(refunded);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(null);
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

    @GetMapping("/range")
    public ResponseEntity<List<Order>> getOrdersInRange(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestHeader("Authorization") String token) {
        List<Order> orders = orderService.getOrdersInRange(start.atStartOfDay(), end.plusDays(1).atStartOfDay());
        return ResponseEntity.ok(orders);
    }
}
