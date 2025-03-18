package com.bibliosphere.backend.repository;
import com.bibliosphere.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
}

