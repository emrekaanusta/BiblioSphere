package com.bibliosphere.backend.service;

import com.bibliosphere.backend.exception.OutOfStockException;
import com.bibliosphere.backend.model.*;
import com.bibliosphere.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /* ---------- cancel order & increment stock ---------- */
    @Transactional
    public Order cancelOrder(String id, String userEmail) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserEmail().equals(userEmail))
            throw new RuntimeException("Forbidden");      // handled elsewhere

        if (order.getStatus() != OrderStatus.PROCESSED)
            throw new RuntimeException("Cannot cancel after it is shipped");

        order.setStatus(OrderStatus.CANCELLED);

        // give stock back
        for (OrderItem item : order.getItems()) {
            productRepo.findById(item.getProductId()).ifPresent(p -> {
                p.setStock(p.getStock() + item.getQuantity());
                productRepo.save(p);
            });
        }

        return orderRepo.save(order);
    }

    /* ---------- queries ---------- */
    public List<Order> getOrdersForUser(String email) {
        return orderRepo.findAllByUserEmailOrderByCreatedAtDesc(email);
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepo.findById(id);
    }

    public Order updateOrderStatus(String orderId, OrderStatus newStatus) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(newStatus);
        return orderRepo.save(order);
    }
}
