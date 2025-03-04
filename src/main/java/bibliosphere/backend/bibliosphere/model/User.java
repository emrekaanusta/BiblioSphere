package bibliosphere.backend.bibliosphere.model;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class User {
    private String password;
    private String email;
    private String name;
    private String surname;
    private String phone;
    private String role;
    private String home_address;
    private String ID;
    private String credit_card;
    private List<String> shopping_cart;
    private List<String> orders;
    private List<String> whishlist;
}
