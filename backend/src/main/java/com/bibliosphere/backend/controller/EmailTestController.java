package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.Order;
import com.bibliosphere.backend.model.ShippingInfo;
import com.bibliosphere.backend.model.OrderItem;
import com.bibliosphere.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/test-email")
public class EmailTestController {

    private final EmailService emailService;
    
    @Value("${app.test.email:test@example.com}")
    private String testEmail;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping
    public ResponseEntity<String> sendTestEmail() {
        try {
            emailService.sendOrderReceipt(createDummyOrder());
            return ResponseEntity.ok("Test email sent successfully!");
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Failed to send test email: " + e.getMessage()
            );
        }
    }

    private Order createDummyOrder() {
        Order dummy = new Order();
        
        ShippingInfo info = new ShippingInfo();
        info.setEmail(testEmail);
        info.setFirstName("Test");
        info.setLastName("User");
        info.setAddress("123 Test Street");
        info.setCity("Test City");
        info.setZipCode("12345");
        
        dummy.setShippingInfo(info);
        dummy.setId("TEST123");
        dummy.setTotal(42.0);
        
        List<OrderItem> items = Arrays.asList(
            new OrderItem("123", "Demo Book 1", 14.99, 1, "https://example.com/book1.jpg"),
            new OrderItem("456", "Demo Book 2", 27.01, 1, "https://example.com/book2.jpg")
        );
        dummy.setItems(items);

        return dummy;
    }
}

