package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.repository.UserRepository;
import com.bibliosphere.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public User getCurrentUser(String email) {
        User currentUser = new User();
        if (email == null) {
            currentUser = null;
        }
        else {
            currentUser = userRepository.findById(email).orElse(null);
        }
        return currentUser;
    }

    public User loadUserByEmail(String email) {
        return userRepository.findById(email).orElse(null);
    }

    public boolean exist(String email) {
        return userRepository.findById(email).isPresent();
    }

    public static String encode(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public void registerUser(User user) {
        String temp_password = user.getPassword();
        user.setPassword(encode(temp_password));
        userRepository.save(user);
    }

    public String login(String email, String password) {
        if (userRepository.findById(email).isPresent()) {
            User user = loadUserByEmail(email);
            if (user != null && user.getPassword().equals(encode(password))) {
                return jwtUtil.generateToken(email);
            }
        }
        return null;
    }

    public boolean passwordCheck(String password) {
        char[] specialChars = {'!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+'};
        if (password.length() < 6) {
            return false;
        }
        for (char c : specialChars) {
            if (password.contains(String.valueOf(c))) {
                return true;
            }
        }
        return false;
    }

    public void removeProductFromWishlist(User user, String productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            user.getWishlist().remove(product);
        }
    }

    // Kullanicinin sepete urun ekleme ve stok dusme func.
    @Override
    public void addProductToCart(User user, String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() <= 0) {
            throw new RuntimeException("Product is out of stock.");
        }

        product.setStock(product.getStock() - 1);
        productRepository.save(product);

        user.getShopping_cart().add(product);
        userRepository.save(user);
    }

    @Override
    public void removeProductFromCart(User user, String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Ürün sepette yoksa çıkarılamaz
        boolean removed = user.getShopping_cart().removeIf(p -> p.getIsbn().equals(productId));
        if (!removed) {
            throw new RuntimeException("Product not found in cart.");
        }

        // Stok geri artırılır
        product.setStock(product.getStock() + 1);
        productRepository.save(product);

        userRepository.save(user);
    }



}
