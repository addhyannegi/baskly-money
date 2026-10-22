package money.baskly.auth.entity;

import jakarta.persistence.*;
import money.baskly.auth.model.AccountStatus;
import money.baskly.auth.model.AuthAccount;
import money.baskly.auth.model.Role;

import java.time.Instant;
import java.time.LocalDate;

/**
 * JPA Entity for AuthAccount, prepared for future PostgreSQL persistent storage.
 */
@Entity
@Table(name = "auth_accounts")
public class AuthAccountEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "first_name", nullable = false, length = 128)
    private String firstName;

    @Column(name = "middle_name", length = 128)
    private String middleName;

    @Column(name = "last_name", nullable = false, length = 128)
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "mobile_country_code", length = 8)
    private String mobileCountryCode = "+91";

    @Column(name = "mobile_number", length = 32)
    private String mobileNumber;

    @Column(name = "address_line_1", length = 255)
    private String addressLine1;

    @Column(name = "address_line_2", length = 255)
    private String addressLine2;

    @Column(name = "city", length = 128)
    private String city;

    @Column(name = "state", length = 128)
    private String state;

    @Column(name = "country", length = 128)
    private String country;

    @Column(name = "gender", length = 64)
    private String gender;

    @Column(name = "terms_version", length = 32)
    private String termsVersion;

    @Column(name = "terms_accepted_at")
    private Instant termsAcceptedAt;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false, length = 32)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 32)
    private Role role = Role.CUSTOMER;

    @Column(name = "google_id", length = 128)
    private String googleId;

    @Column(name = "avatar", length = 512)
    private String avatar;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    public AuthAccountEntity() {}

    public static AuthAccountEntity fromDomain(AuthAccount a) {
        if (a == null) return null;
        AuthAccountEntity e = new AuthAccountEntity();
        e.id = a.getId();
        e.firstName = a.getFirstName();
        e.middleName = a.getMiddleName();
        e.lastName = a.getLastName();
        e.dateOfBirth = a.getDateOfBirth();
        e.email = a.getEmail() != null ? a.getEmail().trim().toLowerCase() : null;
        e.emailVerified = a.isEmailVerified();
        e.mobileCountryCode = a.getMobileCountryCode() != null && !a.getMobileCountryCode().isBlank() 
                ? a.getMobileCountryCode() : "+91";
        e.mobileNumber = a.getMobileNumber();
        e.addressLine1 = a.getAddressLine1();
        e.addressLine2 = a.getAddressLine2();
        e.city = a.getCity();
        e.state = a.getState();
        e.country = a.getCountry();
        e.gender = a.getGender();
        e.termsVersion = a.getTermsVersion();
        e.termsAcceptedAt = a.getTermsAcceptedAt();
        e.passwordHash = a.getPasswordHash();
        e.accountStatus = a.getAccountStatus() != null ? a.getAccountStatus() : AccountStatus.ACTIVE;
        e.role = a.getRole() != null ? a.getRole() : Role.CUSTOMER;
        e.googleId = a.getGoogleId();
        e.avatar = a.getAvatar();
        e.createdAt = a.getCreatedAt() != null ? a.getCreatedAt() : Instant.now();
        e.updatedAt = a.getUpdatedAt() != null ? a.getUpdatedAt() : Instant.now();
        e.lastLoginAt = a.getLastLoginAt();
        return e;
    }

    public AuthAccount toDomain() {
        AuthAccount a = new AuthAccount(
                this.id, this.firstName, this.middleName, this.lastName,
                this.dateOfBirth, this.email, this.emailVerified,
                this.mobileCountryCode, this.mobileNumber,
                this.addressLine1, this.addressLine2,
                this.city, this.state, this.country,
                this.gender, this.termsVersion, this.termsAcceptedAt,
                this.passwordHash, this.accountStatus, this.role,
                this.googleId, this.avatar
        );
        a.setCreatedAt(this.createdAt);
        a.setUpdatedAt(this.updatedAt);
        a.setLastLoginAt(this.lastLoginAt);
        return a;
    }

    // Getters and Setters omitted for brevity or generated as standard
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    public String getMobileCountryCode() { return mobileCountryCode; }
    public void setMobileCountryCode(String mobileCountryCode) { this.mobileCountryCode = mobileCountryCode; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getTermsVersion() { return termsVersion; }
    public void setTermsVersion(String termsVersion) { this.termsVersion = termsVersion; }
    public Instant getTermsAcceptedAt() { return termsAcceptedAt; }
    public void setTermsAcceptedAt(Instant termsAcceptedAt) { this.termsAcceptedAt = termsAcceptedAt; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public AccountStatus getAccountStatus() { return accountStatus; }
    public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Instant lastLoginAt) { this.lastLoginAt = lastLoginAt; }
}
