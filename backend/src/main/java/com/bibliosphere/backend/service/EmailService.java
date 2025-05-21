package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.Order;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.beans.factory.annotation.Autowired;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    private JavaMailSender javaMailSender;

    public void sendOrderReceipt(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getShippingInfo().getEmail());
            helper.setSubject("Your BiblioSphere Order Receipt 📚");

            StringBuilder content = new StringBuilder();
            content.append("<h2>Thank you for your order, ")
                    .append(order.getShippingInfo().getFirstName())
                    .append("!</h2>");
            content.append("<p><strong>Order ID:</strong> ").append(order.getId()).append("</p>");
            content.append("<p><strong>Total:</strong> $").append(String.format("%.2f", order.getTotal())).append("</p>");
            content.append("<h3>Items:</h3><ul>");

            for (var item : order.getItems()) {
                content.append("<li>")
                        .append(item.getTitle())
                        .append(" x ")
                        .append(item.getQuantity())
                        .append("</li>");
            }

            content.append("</ul>");
            content.append("<p>We'll notify you once your order ships.</p>");

            helper.setText(content.toString(), true);
            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace(); // For debugging; replace with a logger in production
        }
    }

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        javaMailSender.send(message);
    }
}
