package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.Order;
import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.repository.OrderRepository;
import com.bibliosphere.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public Order createOrder(String userEmail, List<Order.OrderItem> items, double totalAmount, 
                           double shippingCost, String shippingAddress) {
        Order order = new Order();
        order.setUserEmail(userEmail);
        order.setItems(items);
        order.setTotalAmount(totalAmount);
        order.setShippingCost(shippingCost);
        order.setShippingAddress(shippingAddress);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");

        Order savedOrder = orderRepository.save(order);

        // Send confirmation email
        emailService.sendOrderConfirmation(userEmail, savedOrder);

        // Clear user's shopping cart
        User user = userRepository.findById(userEmail).orElse(null);
        if (user != null) {
            user.getShopping_cart().clear();
            userRepository.save(user);
        }

        return savedOrder;
    }

    public List<Order> getUserOrders(String userEmail) {
        return orderRepository.findAll().stream()
                .filter(order -> order.getUserEmail().equals(userEmail))
                .toList();
    }
} 