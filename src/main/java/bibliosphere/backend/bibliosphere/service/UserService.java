package bibliosphere.backend.bibliosphere.service;

import bibliosphere.backend.bibliosphere.model.User;
import bibliosphere.backend.bibliosphere.repository.UserRepository;
import bibliosphere.backend.bibliosphere.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;

    public User loadUserByEmail (String email) {
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
                if (hex.length() == 1) {
                    hexString.append('0');
                }
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

        for(char c : specialChars) {
            if(password.contains(String.valueOf(c))) {
                return true;
            }
        }
        return false;
    }
}
