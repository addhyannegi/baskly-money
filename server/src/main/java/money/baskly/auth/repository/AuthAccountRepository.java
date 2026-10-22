package money.baskly.auth.repository;

import money.baskly.auth.model.AuthAccount;
import java.util.List;
import java.util.Optional;

/**
 * Persistence port for Authentication and User Accounts.
 * Allows switching between In-Memory development storage and PostgreSQL JPA storage
 * without touching core authentication business logic.
 */
public interface AuthAccountRepository {

    Optional<AuthAccount> findById(String id);

    Optional<AuthAccount> findByEmail(String email);

    Optional<AuthAccount> findByGoogleId(String googleId);

    boolean existsByEmail(String email);

    AuthAccount save(AuthAccount account);

    List<AuthAccount> findAll();

    void deleteById(String id);
}
