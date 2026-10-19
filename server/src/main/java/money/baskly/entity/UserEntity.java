package money.baskly.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "avatar", length = 512)
    private String avatar;

    @Column(name = "given_name", length = 128)
    private String givenName;

    @Column(name = "role", length = 32, nullable = false)
    private String role = "retail";

    @Column(name = "kyc_status", length = 32, nullable = false)
    private String kycStatus = "VERIFIED";

    @Column(name = "pan", length = 16)
    private String pan;

    @Column(name = "cash_balance_inr", precision = 18, scale = 2, nullable = false)
    private BigDecimal cashBalanceInr = new BigDecimal("25000.00");

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public UserEntity() {}

    public UserEntity(String id, String name, String email, String avatar, String givenName, String role, String kycStatus, String pan, BigDecimal cashBalanceInr) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatar = avatar;
        this.givenName = givenName;
        this.role = role != null ? role : "retail";
        this.kycStatus = kycStatus != null ? kycStatus : "VERIFIED";
        this.pan = pan;
        this.cashBalanceInr = cashBalanceInr != null ? cashBalanceInr : new BigDecimal("25000.00");
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getGivenName() { return givenName; }
    public void setGivenName(String givenName) { this.givenName = givenName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getKycStatus() { return kycStatus; }
    public void setKycStatus(String kycStatus) { this.kycStatus = kycStatus; }

    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }

    public BigDecimal getCashBalanceInr() { return cashBalanceInr; }
    public void setCashBalanceInr(BigDecimal cashBalanceInr) { this.cashBalanceInr = cashBalanceInr; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
