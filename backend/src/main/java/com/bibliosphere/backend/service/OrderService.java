package com.bibliosphere.backend.service;

import com.bibliosphere.backend.exception.OutOfStockException;
import com.bibliosphere.backend.model.*;
import com.bibliosphere.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository    orderRepo;
    private final ProductRepository  productRepo;
    private final UserRepository     userRepo;
    private final EmailService       emailService;   // already existed

    /* ---------- create order & decrement stock ---------- */
    @Transactional
    public Order createOrder(Order order) {

        // check / decrement each line
        for (OrderItem item : order.getItems()) {
            Product p = productRepo.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (p.getStock() < item.getQuantity()) {
                throw new OutOfStockException(p.getTitle());
            }
            p.setStock(p.getStock() - item.getQuantity());
            productRepo.save(p);
        }

        Order saved = orderRepo.save(order);

        // attach order ID to user doc (if you track it)
        userRepo.findById(order.getUserEmail()).ifPresent(u -> {
            u.getOrders().add(saved.getId());
            userRepo.save(u);
        });

        emailService.sendOrderReceipt(saved);
        return saved;
    }

    @Transactional
    public Order refundOrder(String id, String userEmail) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserEmail().equals(userEmail))
            throw new RuntimeException("Forbidden");

        if (order.getStatus() != OrderStatus.DELIVERED)
            throw new RuntimeException("Only delivered orders can be refunded");

        if (order.getCreatedAt() == null)
            throw new RuntimeException("Order has no timestamp");

        long daysSince = java.time.Duration.between(order.getCreatedAt(), Instant.now()).toDays();
        if (daysSince > 30)
            throw new RuntimeException("Refund period (30 days) has expired");

        order.setStatus(OrderStatus.REFUND_PENDING);
        return orderRepo.save(order);
    }
    public List<Order> getPendingRefunds() {
        return orderRepo.findByStatus(OrderStatus.REFUND_PENDING);
    }
    @Transactional
    public Order handleRefund(String orderId, String action) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.REFUND_PENDING) {
            throw new RuntimeException("Order is not in REFUND_PENDING state.");
        }

        if (action.equalsIgnoreCase("accept")) {
            order.setStatus(OrderStatus.REFUNDED);
        } else if (action.equalsIgnoreCase("reject")) {
            order.setStatus(OrderStatus.DELIVERED); // İstersen PROCESSED veya başka statüye döndürebilirsin
        } else {
            throw new RuntimeException("Invalid action: must be 'accept' or 'reject'");
        }

        return orderRepo.save(order);
    }

    @Transactional
    public Order updateOrderStatus(String id, String newStatus, String requesterEmail) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Allow if requester is the order owner OR admin (fake-admin-token maps to "admin")
        if (!order.getUserEmail().equals(requesterEmail) && !requesterEmail.equals("admin")) {
            throw new RuntimeException("Forbidden");
        }

        try {
            order.setStatus(OrderStatus.valueOf(newStatus));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value");
        }

        return orderRepo.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }
    /* ---------- cancel order & increment stock ---------- */
    @Transactional
    public Order cancelOrder(String id, String userEmail) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserEmail().equals(userEmail))
            throw new RuntimeException("Forbidden");      // handled elsewhere

        if (order.getStatus() != OrderStatus.PROCESSED)
            throw new RuntimeException("Cannot cancel after it is shipped");

        // Instead of cancelling immediately, set to REFUND_PENDING for manager approval
        order.setStatus(OrderStatus.REFUND_PENDING);
        // Do NOT update stock here; wait for manager approval
        return orderRepo.save(order);
    }

    /* ---------- queries ---------- */
    public List<Order> getOrdersForUser(String email) {
        return orderRepo.findAllByUserEmailOrderByCreatedAtDesc(email);
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepo.findById(id);
    }

    public List<Order> getOrdersInRange(LocalDateTime start, LocalDateTime end) {
        return orderRepo.findByCreatedAtBetween(start, end);
    }
}
