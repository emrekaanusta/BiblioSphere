package bibliosphere.backend.bibliosphere.repository;
import bibliosphere.backend.bibliosphere.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
}
