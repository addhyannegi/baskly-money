package money.baskly.auth.repository;

import money.baskly.auth.entity.AuthAccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for AuthAccountEntity.
 * Directly maps to PostgreSQL table public.auth_accounts.
 */
@Repository
public interface SpringDataAuthAccountRepository extends JpaRepository<AuthAccountEntity, String> {

    Optional<AuthAccountEntity> findByEmailIgnoreCase(String email);

    Optional<AuthAccountEntity> findByGoogleId(String googleId);

    boolean existsByEmailIgnoreCase(String email);
}
