package money.baskly.auth.repository;

import jakarta.annotation.PostConstruct;
import money.baskly.auth.model.AccountStatus;
import money.baskly.auth.model.AuthAccount;
import money.baskly.auth.model.Role;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory development repository port implementation.
 * Used for development and testing when an active PostgreSQL database instance is not connected.
 * 
 * Note: Storage is transient across JVM restarts. Durability is achieved when the PostgreSQL
 * JPA repository implementation is activated.
 */
@Repository
public class InMemoryAuthAccountRepository implements AuthAccountRepository {

    private final ConcurrentHashMap<String, AuthAccount> accountsById = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> idByEmail = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> idByGoogleId = new ConcurrentHashMap<>();

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public InMemoryAuthAccountRepository() {
        seedInitialAccounts();
    }

    @PostConstruct
    public void seedInitialAccounts() {
        if (!accountsById.isEmpty()) return;

        // Pre-seed privileged accounts for development/testing
        // 1. ADMIN
        seedAccount(new AuthAccount(
                "usr_admin_001",
                "System", null, "Admin",
                LocalDate.of(1985, 6, 15),
                "admin@baskly.money", true,
                "+91", "9876543210",
                "Dalal Street Towers, Level 24", null,
                "Mumbai", "Maharashtra", "India",
                "Male", "v1.0", Instant.now(),
                passwordEncoder.encode("AdminPassword@123"),
                AccountStatus.ACTIVE, Role.ADMIN,
                null, "https://api.dicebear.com/7.x/initials/svg?seed=SystemAdmin"
        ));

        // 2. FUND_MANAGER
        seedAccount(new AuthAccount(
                "usr_manager_001",
                "Chief", "Investment", "Officer",
                LocalDate.of(1988, 3, 22),
                "manager@baskly.money", true,
                "+91", "9876543211",
                "Baskly Capital Desk, BKC", null,
                "Mumbai", "Maharashtra", "India",
                "Female", "v1.0", Instant.now(),
                passwordEncoder.encode("ManagerPassword@123"),
                AccountStatus.ACTIVE, Role.FUND_MANAGER,
                null, "https://api.dicebear.com/7.x/initials/svg?seed=CIO"
        ));

        // 3. SUPPORT
        seedAccount(new AuthAccount(
                "usr_support_001",
                "Support", null, "Specialist",
                LocalDate.of(1995, 9, 10),
                "support@baskly.money", true,
                "+91", "9876543212",
                "Operations Center, Sector 5", null,
                "Bengaluru", "Karnataka", "India",
                "Non-binary", "v1.0", Instant.now(),
                passwordEncoder.encode("SupportPassword@123"),
                AccountStatus.ACTIVE, Role.SUPPORT,
                null, "https://api.dicebear.com/7.x/initials/svg?seed=SupportSpecialist"
        ));

        // 4. CUSTOMER
        seedAccount(new AuthAccount(
                "usr_customer_001",
                "Rohan", null, "Investor",
                LocalDate.of(1996, 5, 20),
                "customer@baskly.money", true,
                "+91", "9876543213",
                "42 Green Park Residency", null,
                "Bengaluru", "Karnataka", "India",
                "Male", "v1.0", Instant.now(),
                passwordEncoder.encode("CustomerPassword@123"),
                AccountStatus.ACTIVE, Role.CUSTOMER,
                null, "https://api.dicebear.com/7.x/initials/svg?seed=RohanInvestor"
        ));
    }

    private void seedAccount(AuthAccount account) {
        accountsById.put(account.getId(), account);
        if (account.getEmail() != null) {
            idByEmail.put(account.getEmail().toLowerCase(), account.getId());
        }
        if (account.getGoogleId() != null) {
            idByGoogleId.put(account.getGoogleId(), account.getId());
        }
    }

    @Override
    public Optional<AuthAccount> findById(String id) {
        if (id == null) return Optional.empty();
        return Optional.ofNullable(accountsById.get(id));
    }

    @Override
    public Optional<AuthAccount> findByEmail(String email) {
        if (email == null) return Optional.empty();
        String id = idByEmail.get(email.trim().toLowerCase());
        if (id == null) return Optional.empty();
        return Optional.ofNullable(accountsById.get(id));
    }

    @Override
    public Optional<AuthAccount> findByGoogleId(String googleId) {
        if (googleId == null) return Optional.empty();
        String id = idByGoogleId.get(googleId);
        if (id == null) return Optional.empty();
        return Optional.ofNullable(accountsById.get(id));
    }

    @Override
    public boolean existsByEmail(String email) {
        if (email == null) return false;
        return idByEmail.containsKey(email.trim().toLowerCase());
    }

    @Override
    public AuthAccount save(AuthAccount account) {
        if (account.getId() == null || account.getId().isBlank()) {
            account.setId("usr_" + java.util.UUID.randomUUID().toString().replace("-", ""));
        }
        account.setUpdatedAt(Instant.now());
        accountsById.put(account.getId(), account);
        if (account.getEmail() != null) {
            idByEmail.put(account.getEmail().trim().toLowerCase(), account.getId());
        }
        if (account.getGoogleId() != null) {
            idByGoogleId.put(account.getGoogleId(), account.getId());
        }
        return account;
    }

    @Override
    public List<AuthAccount> findAll() {
        return new ArrayList<>(accountsById.values());
    }

    @Override
    public void deleteById(String id) {
        AuthAccount removed = accountsById.remove(id);
        if (removed != null) {
            if (removed.getEmail() != null) {
                idByEmail.remove(removed.getEmail().toLowerCase());
            }
            if (removed.getGoogleId() != null) {
                idByGoogleId.remove(removed.getGoogleId());
            }
        }
    }
}
