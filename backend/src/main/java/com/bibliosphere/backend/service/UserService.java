package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.Product;
import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.repository.ProductRepository;
import com.bibliosphere.backend.repository.UserRepository;
import com.bibliosphere.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Iterator;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ProductRepository productRepository;

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

    public void addProductToWishlist(User user, String isbn) {
        Product product = productRepository.findById(isbn).orElse(null);
        if (product != null) {
            user.getWishlist().add(product);
            userRepository.save(user);
        }
    }

    public void removeProductFromWishlist(User user, String productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            user.getWishlist().remove(product);
            userRepository.save(user);
        }
    }

    public boolean addProductToCart(User user, String isbn) {
        Product product = productRepository.findById(isbn).orElse(null);
        if (product != null) {
            if (product.getStock() == 0) {
                return false;
            }
            product.setStock(product.getStock() - 1);
            if (user.getEmail()==null){
                productRepository.save(product);
                return true;
            }
            user.getWishlist().add(product);
            userRepository.save(user);
            productRepository.save(product);
            return true;
        }
        return false;
    }

    public boolean removeProductFromCart(User user, String productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            if (user.getEmail() == null) {
                product.setStock(product.getStock() + 1);
                productRepository.save(product);
                return true;
            }

            List<Product> cart = user.getShopping_cart();
            Iterator<Product> iterator = cart.iterator();
            boolean removed = false;
            while (iterator.hasNext()) {
                Product p = iterator.next();
                if (p.getIsbn().equals(productId)) {
                    iterator.remove();
                    removed = true;
                    break;
                }
            }
            if (!removed) {
                return false;
            }
            product.setStock(product.getStock() + 1);
            productRepository.save(product);
            userRepository.save(user);
            return true;
        }
        return false;
    }
}
