package money.baskly.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "upi_mandates", indexes = {
    @Index(name = "idx_mandates_user", columnList = "user_id, status")
})
public class UpiMandateEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;

    @Column(name = "basket_id", length = 64, nullable = false)
    private String basketId;

    @Column(name = "monthly_amount_inr", precision = 15, scale = 2, nullable = false)
    private BigDecimal monthlyAmountInr;

    @Column(name = "debit_day", nullable = false)
    private Integer debitDay;

    @Column(name = "status", length = 32, nullable = false)
    private String status = "ACTIVE";

    @Column(name = "vpa", nullable = false)
    private String vpa;

    @Column(name = "next_debit_date", nullable = false)
    private LocalDate nextDebitDate;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public UpiMandateEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public BigDecimal getMonthlyAmountInr() { return monthlyAmountInr; }
    public void setMonthlyAmountInr(BigDecimal monthlyAmountInr) { this.monthlyAmountInr = monthlyAmountInr; }

    public Integer getDebitDay() { return debitDay; }
    public void setDebitDay(Integer debitDay) { this.debitDay = debitDay; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getVpa() { return vpa; }
    public void setVpa(String vpa) { this.vpa = vpa; }

    public LocalDate getNextDebitDate() { return nextDebitDate; }
    public void setNextDebitDate(LocalDate nextDebitDate) { this.nextDebitDate = nextDebitDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
