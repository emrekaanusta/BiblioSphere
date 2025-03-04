package bibliosphere.backend.bibliosphere.service;

import bibliosphere.backend.bibliosphere.model.User;
import bibliosphere.backend.bibliosphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User loadUserByEmail (String email) {
        return userRepository.findById(email).orElse(null);
    }
    public boolean exist(String email) {
        return userRepository.findById(email).isPresent();
    }
    public void registerUser(User user) {
        userRepository.save(user);
    }
}
