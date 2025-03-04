package bibliosphere.backend.bibliosphere.service;

import bibliosphere.backend.bibliosphere.model.User;
import bibliosphere.backend.bibliosphere.repository.UserRepository;
import bibliosphere.backend.bibliosphere.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    public void registerUser(User user) {
        userRepository.save(user);
    }

    public String login(String email, String password) {
        if (userRepository.findById(email).isPresent()) {
            User user = loadUserByEmail(email);
            if (user != null && user.getPassword().equals(password)) {
                return jwtUtil.generateToken(email);
            }
        }
        return null;
    }
}
