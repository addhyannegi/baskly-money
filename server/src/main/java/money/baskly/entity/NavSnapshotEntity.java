package money.baskly.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "nav_snapshots", indexes = {
    @Index(name = "idx_nav_snapshots_basket", columnList = "basket_id, recorded_at")
})
public class NavSnapshotEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "basket_id", length = 64, nullable = false)
    private String basketId;

    @Column(name = "nav", precision = 15, scale = 4, nullable = false)
    private BigDecimal nav;

    @Column(name = "recorded_at")
    private Instant recordedAt = Instant.now();

    public NavSnapshotEntity() {}

    public NavSnapshotEntity(String basketId, BigDecimal nav, Instant recordedAt) {
        this.basketId = basketId;
        this.nav = nav;
        this.recordedAt = recordedAt != null ? recordedAt : Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public String getFundId() { return basketId; }
    public void setFundId(String fundId) { this.basketId = fundId; }

    public BigDecimal getNav() { return nav; }
    public void setNav(BigDecimal nav) { this.nav = nav; }

    public BigDecimal getNavInr() { return nav; }
    public void setNavInr(BigDecimal navInr) { this.nav = navInr; }

    public Instant getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }

    public Instant getTimestamp() { return recordedAt; }
    public void setTimestamp(Instant timestamp) { this.recordedAt = timestamp; }
}
