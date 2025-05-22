package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.User;
import com.bibliosphere.backend.model.WishlistCluster;
import com.bibliosphere.backend.repository.UserRepository;
import com.bibliosphere.backend.repository.WishlistClusterRepository;
import com.bibliosphere.backend.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WishlistClusterRepository wishlistClusterRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public User loadUserByEmail(String email) {
        logger.debug("Loading user by email: {}", email);
        User user = userRepository.findById(email).orElse(null);
        if (user == null) {
            logger.debug("User not found for email: {}", email);
        } else {
            logger.debug("User found: {}", user.getEmail());
        }
        return user;
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
        logger.debug("Starting user registration for: {}", user.getEmail());
        
        // Initialize all fields
        if (user.getShopping_cart() == null) {
            user.setShopping_cart(new ArrayList<>());
        }
        if (user.getOrders() == null) {
            user.setOrders(new ArrayList<>());
        }
        if (user.getWishlist() == null) {
            user.setWishlist(new ArrayList<>());
        }
        if (user.getRole() == null) {
            user.setRole("customer");
        }
        if (user.getTaxid() == null) {
            user.setTaxid("");
        }
        if (user.getAddress() == null) {
            user.setAddress("");
        }
        if (user.getZipCode() == null) {
            user.setZipCode("");
        }
        if (user.getCity() == null) {
            user.setCity("");
        }

        // Encode password
        String temp_password = user.getPassword();
        user.setPassword(encode(temp_password));
        
        try {
            // Save user to MongoDB
            User savedUser = userRepository.save(user);
            logger.debug("User registered successfully: {}", savedUser.getEmail());
            logger.debug("User document in MongoDB: {}", savedUser);

            // Create wishlist cluster for the new user
            WishlistCluster wishlistCluster = new WishlistCluster();
            wishlistCluster.setUserEmail(user.getEmail());
            wishlistCluster.setName(user.getName());
            wishlistCluster.setSurname(user.getSurname());
            wishlistCluster.setWishlist(new ArrayList<>());
            wishlistCluster.setAddress("");
            wishlistCluster.setZipCode("");
            wishlistCluster.setCity("");

            wishlistClusterRepository.save(wishlistCluster);
            logger.debug("Wishlist cluster created for user: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Error saving user to MongoDB: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to register user: " + e.getMessage());
        }
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

    // For demo: token is the user email (not secure).
    public User getUserFromToken(String token) {
        return userRepository.findById(token).orElse(null);
    }

    // Add a product ID to the user's wishlist
    public User addToWishlist(User user, String productId) {
        logger.debug("Adding product {} to wishlist for user: {}", productId, user.getEmail());
        
        if (user.getWishlist() == null) {
            logger.debug("Creating new wishlist array for user: {}", user.getEmail());
            user.setWishlist(new ArrayList<>());
        }
        
        if (!user.getWishlist().contains(productId)) {
            logger.debug("Adding product {} to wishlist", productId);
            user.getWishlist().add(productId);
            try {
                User savedUser = userRepository.save(user);
                logger.debug("Updated user document in MongoDB: {}", savedUser);
                return savedUser;
            } catch (Exception e) {
                logger.error("Error saving wishlist update to MongoDB: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to update wishlist: " + e.getMessage());
            }
        } else {
            logger.debug("Product {} already in wishlist", productId);
            return user;
        }
    }

    // Remove a product ID from the user's wishlist
    public User removeFromWishlist(User user, String productId) {
        if (user.getWishlist() != null) {
            user.getWishlist().remove(productId);
        }
        return userRepository.save(user);
    }

    public void clearUserCart(String email) {
        User user = loadUserByEmail(email);
        if (user != null) {
            user.setShopping_cart(new ArrayList<>());
            userRepository.save(user);
        }
    }

    public List<User> getUsersWithProductInWishlist(String productId) {
        return userRepository.findByWishlistContaining(productId);
    }
}
