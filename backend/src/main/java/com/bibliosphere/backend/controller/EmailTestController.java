package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.Order;
import com.bibliosphere.backend.model.ShippingInfo;
import com.bibliosphere.backend.model.OrderItem;
import com.bibliosphere.backend.service.EmailService;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/test-email")
public class EmailTestController {

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping
    public String sendTestEmail() {
        emailService.sendOrderReceipt(createDummyOrder());
        return "Test email sent!";
    }

    private Order createDummyOrder() {
        Order dummy = new Order();
        ShippingInfo info = new ShippingInfo();
        info.setEmail("emrekaanusta09@gmail.com");  // Use your Mailtrap test address
        info.setFirstName("Test");

        dummy.setShippingInfo(info);
        dummy.setId("TEST123");
        dummy.setTotal(42.0);
        //dummy.setItems(List.of(new OrderItem("123", "Demo Book", 14.99, 2, 0)));

        return dummy;
    }
}

