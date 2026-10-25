package money.baskly.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * JPA Entity mapping historical NAV records.
 * Directly provides fund_id, nav_inr, and timestamp schema properties.
 */
@Entity
@Table(name = "nav_snapshots", indexes = {
    @Index(name = "idx_nav_history_fund_time", columnList = "basket_id, recorded_at")
})
public class NavHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "basket_id", length = 64, nullable = false)
    private String fundId;

    @Column(name = "nav", precision = 15, scale = 4, nullable = false)
    private BigDecimal navInr;

    @Column(name = "recorded_at")
    private Instant timestamp = Instant.now();

    @Transient
    private BigDecimal aumInr;

    @Transient
    private BigDecimal change24h;

    public NavHistoryEntity() {}

    public NavHistoryEntity(String fundId, BigDecimal navInr, Instant timestamp) {
        this.fundId = fundId;
        this.navInr = navInr;
        this.timestamp = timestamp != null ? timestamp : Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFundId() { return fundId; }
    public void setFundId(String fundId) { this.fundId = fundId; }

    public String getBasketId() { return fundId; }
    public void setBasketId(String basketId) { this.fundId = basketId; }

    public BigDecimal getNavInr() { return navInr; }
    public void setNavInr(BigDecimal navInr) { this.navInr = navInr; }

    public BigDecimal getNav() { return navInr; }
    public void setNav(BigDecimal nav) { this.navInr = nav; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Instant getRecordedAt() { return timestamp; }
    public void setRecordedAt(Instant recordedAt) { this.timestamp = recordedAt; }

    public BigDecimal getAumInr() { return aumInr; }
    public void setAumInr(BigDecimal aumInr) { this.aumInr = aumInr; }

    public BigDecimal getChange24h() { return change24h; }
    public void setChange24h(BigDecimal change24h) { this.change24h = change24h; }
}
