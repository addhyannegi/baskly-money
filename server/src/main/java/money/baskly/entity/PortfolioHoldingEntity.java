package money.baskly.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "portfolio_holdings", uniqueConstraints = {
    @UniqueConstraint(name = "uq_user_basket", columnNames = {"user_id", "basket_id"})
}, indexes = {
    @Index(name = "idx_holdings_user", columnList = "user_id")
})
public class PortfolioHoldingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;

    @Column(name = "basket_id", length = 64, nullable = false)
    private String basketId;

    @Column(name = "units", precision = 18, scale = 6, nullable = false)
    private BigDecimal units = BigDecimal.ZERO;

    @Column(name = "avg_buy_nav", precision = 15, scale = 4, nullable = false)
    private BigDecimal avgBuyNav = new BigDecimal("100.0000");

    @Column(name = "invested_amount_inr", precision = 18, scale = 2, nullable = false)
    private BigDecimal investedAmountInr = BigDecimal.ZERO;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public PortfolioHoldingEntity() {}

    public PortfolioHoldingEntity(String userId, String basketId, BigDecimal units, BigDecimal avgBuyNav, BigDecimal investedAmountInr) {
        this.userId = userId;
        this.basketId = basketId;
        this.units = units != null ? units : BigDecimal.ZERO;
        this.avgBuyNav = avgBuyNav != null ? avgBuyNav : new BigDecimal("100.0000");
        this.investedAmountInr = investedAmountInr != null ? investedAmountInr : BigDecimal.ZERO;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public BigDecimal getUnits() { return units; }
    public void setUnits(BigDecimal units) { this.units = units; }

    public BigDecimal getAvgBuyNav() { return avgBuyNav; }
    public void setAvgBuyNav(BigDecimal avgBuyNav) { this.avgBuyNav = avgBuyNav; }

    public BigDecimal getInvestedAmountInr() { return investedAmountInr; }
    public void setInvestedAmountInr(BigDecimal investedAmountInr) { this.investedAmountInr = investedAmountInr; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
