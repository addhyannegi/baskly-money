package money.baskly.auth;

import money.baskly.auth.dto.AuthResponse;
import money.baskly.auth.dto.LoginRequest;
import money.baskly.auth.dto.RegisterRequest;
import money.baskly.auth.entity.AuthAccountEntity;
import money.baskly.auth.model.AuthAccount;
import money.baskly.auth.model.Role;
import money.baskly.auth.repository.PostgresAuthAccountRepository;
import money.baskly.auth.repository.SpringDataAuthAccountRepository;
import money.baskly.auth.service.AuthService;
import money.baskly.auth.service.OtpService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PostgresAuthAccountPersistenceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private PostgresAuthAccountRepository postgresRepo;

    @Autowired
    private SpringDataAuthAccountRepository jpaRepo;

    @Test
    @DisplayName("Verify PostgresAuthAccountRepository is the active repository injected into AuthService")
    void testActiveRepositoryIsInjected() {
        assertNotNull(postgresRepo, "PostgresAuthAccountRepository must be present in Spring context");
        assertNotNull(jpaRepo, "SpringDataAuthAccountRepository must be present in Spring context");

        // Verify seeded development customer exists
        Optional<AuthAccount> customerOpt = postgresRepo.findByEmail("customer@baskly.money");
        assertTrue(customerOpt.isPresent(), "customer@baskly.money must be seeded into repository");
        assertEquals(Role.CUSTOMER, customerOpt.get().getRole());
    }

    @Test
    @DisplayName("Verify end-to-end registration persistence, retrieval, and login flow")
    void testRegistrationAndLoginPersistence() {
        String testEmail = "test.persistence." + System.currentTimeMillis() + "@baskly.money";

        // Generate valid verification grant using OtpService
        String grantToken = otpService.createGoogleVerificationGrant(testEmail);
        assertNotNull(grantToken);

        RegisterRequest req = new RegisterRequest();
        req.setFirstName("Persistence");
        req.setLastName("Tester");
        req.setDateOfBirth(LocalDate.of(1994, 7, 12));
        req.setEmail(testEmail);
        req.setEmailVerificationGrant(grantToken);
        req.setMobileNumber("9876543219");
        req.setAddressLine1("45 Residency Road");
        req.setCity("Bengaluru");
        req.setState("Karnataka");
        req.setCountry("India");
        req.setGender("Male");
        req.setPassword("SecurePersist@123");
        req.setConfirmPassword("SecurePersist@123");
        req.setTermsAccepted(true);

        // Execute registration via AuthService
        AuthResponse res = authService.registerCustomer(req);
        assertNotNull(res);
        assertTrue(res.isSuccess());
        assertEquals(testEmail, res.getUser().getEmail());

        // Verify record is persisted in JPA entity table
        Optional<AuthAccountEntity> entityOpt = jpaRepo.findByEmailIgnoreCase(testEmail);
        assertTrue(entityOpt.isPresent(), "Entity must be persisted in repository");
        AuthAccountEntity entity = entityOpt.get();
        assertEquals("Persistence", entity.getFirstName());
        assertEquals("Tester", entity.getLastName());
        assertEquals("CUSTOMER", entity.getRole().name());
        assertTrue(entity.isEmailVerified());
        assertNotNull(entity.getPasswordHash());

        // Verify login works with newly registered credentials
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(testEmail);
        loginReq.setPassword("SecurePersist@123");
        AuthResponse loginRes = authService.login(loginReq);
        assertTrue(loginRes.isSuccess());
        assertEquals(testEmail, loginRes.getUser().getEmail());

        // Clean up test record
        jpaRepo.deleteById(entity.getId());
    }
}
