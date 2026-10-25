package money.baskly.auth.repository;

import jakarta.annotation.PostConstruct;
import money.baskly.auth.entity.AuthAccountEntity;
import money.baskly.auth.model.AccountStatus;
import money.baskly.auth.model.AuthAccount;
import money.baskly.auth.model.Role;
import money.baskly.entity.UserEntity;
import money.baskly.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * PostgreSQL persistent implementation of AuthAccountRepository.
 * Bridges domain AuthAccount models with JPA AuthAccountEntity to ensure
 * durable storage in table public.auth_accounts.
 */
@Repository
@Primary
public class PostgresAuthAccountRepository implements AuthAccountRepository {

    private static final Logger log = LoggerFactory.getLogger(PostgresAuthAccountRepository.class);

    private final SpringDataAuthAccountRepository jpaRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public PostgresAuthAccountRepository(SpringDataAuthAccountRepository jpaRepository,
                                         @Autowired(required = false) UserRepository userRepository) {
        this.jpaRepository = jpaRepository;
        this.userRepository = userRepository;
    }

    public PostgresAuthAccountRepository(SpringDataAuthAccountRepository jpaRepository) {
        this(jpaRepository, null);
    }

    @PostConstruct
    @Transactional
    public void seedInitialAccounts() {
        // Pre-seed privileged and development accounts if not already present
        seedAccountIfMissing(
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
        );

        seedAccountIfMissing(
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
        );

        seedAccountIfMissing(
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
        );

        seedAccountIfMissing(
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
        );

        // Pre-seed demo retail user so its email and portfolio cannot be hijacked by public registration
        seedAccountIfMissing(
                "usr_demo_retail",
                "Rohan", null, "Verma",
                LocalDate.of(1996, 5, 20),
                "rohan@baskly.money", true,
                "+91", "9876543214",
                "42 Green Park Residency", null,
                "Bengaluru", "Karnataka", "India",
                "Male", "v1.0", Instant.now(),
                passwordEncoder.encode("CustomerPassword@123"),
                AccountStatus.ACTIVE, Role.CUSTOMER,
                null, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
        );
    }

    private void seedAccountIfMissing(String id, String firstName, String middleName, String lastName,
                                      LocalDate dob, String email, boolean verified,
                                      String code, String mobile, String addr1, String addr2,
                                      String city, String state, String country,
                                      String gender, String termsVersion, Instant termsAt,
                                      String passwordHash, AccountStatus status, Role role,
                                      String googleId, String avatar) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : null;
        if (normalizedEmail != null && !jpaRepository.existsByEmailIgnoreCase(normalizedEmail) && !jpaRepository.existsById(id)) {
            AuthAccount account = new AuthAccount(
                    id, firstName, middleName, lastName, dob, normalizedEmail, verified,
                    code, mobile, addr1, addr2, city, state, country, gender,
                    termsVersion, termsAt, passwordHash, status, role, googleId, avatar
            );
            AuthAccountEntity entity = AuthAccountEntity.fromDomain(account);
            jpaRepository.save(entity);
            log.info("Seeded initial authentication account into PostgreSQL: {} ({})", normalizedEmail, role);
        }

        if (userRepository != null && !userRepository.existsById(id) && (normalizedEmail == null || !userRepository.existsByEmail(normalizedEmail))) {
            String fullName = firstName + (middleName != null && !middleName.isBlank() ? " " + middleName : "") +
                    (lastName != null && !lastName.isBlank() ? " " + lastName : "");
            UserEntity user = new UserEntity(
                    id,
                    fullName,
                    normalizedEmail != null ? normalizedEmail : id + "@baskly.money",
                    avatar,
                    firstName,
                    role != null ? role.toLegacyPortalRole() : "retail",
                    "VERIFIED",
                    null,
                    new BigDecimal("25000.00")
            );
            userRepository.save(user);
            log.info("Seeded initial user portfolio entity into PostgreSQL: {} ({})", id, normalizedEmail);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AuthAccount> findById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();
        return jpaRepository.findById(id).map(AuthAccountEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AuthAccount> findByEmail(String email) {
        if (email == null || email.isBlank()) return Optional.empty();
        return jpaRepository.findByEmailIgnoreCase(email.trim()).map(AuthAccountEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AuthAccount> findByGoogleId(String googleId) {
        if (googleId == null || googleId.isBlank()) return Optional.empty();
        return jpaRepository.findByGoogleId(googleId.trim()).map(AuthAccountEntity::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        if (email == null || email.isBlank()) return false;
        return jpaRepository.existsByEmailIgnoreCase(email.trim());
    }

    @Override
    @Transactional
    public AuthAccount save(AuthAccount account) {
        if (account == null) {
            throw new IllegalArgumentException("Account cannot be null");
        }
        if (account.getId() == null || account.getId().isBlank()) {
            account.setId("usr_" + UUID.randomUUID().toString().replace("-", ""));
        }
        if (account.getEmail() != null) {
            account.setEmail(account.getEmail().trim().toLowerCase());
        }
        if (account.getCreatedAt() == null) {
            account.setCreatedAt(Instant.now());
        }
        account.setUpdatedAt(Instant.now());

        AuthAccountEntity entity = AuthAccountEntity.fromDomain(account);
        AuthAccountEntity saved = jpaRepository.saveAndFlush(entity);
        return saved.toDomain();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuthAccount> findAll() {
        return jpaRepository.findAll().stream()
                .map(AuthAccountEntity::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public void deleteById(String id) {
        if (id != null && !id.isBlank()) {
            jpaRepository.deleteById(id);
            jpaRepository.flush();
        }
    }
}
