package money.baskly.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class NavSnapshotDto {
    private Long id;
    private String basketId;
    private BigDecimal nav;
    private Instant recordedAt;
    private BigDecimal change24h;
    private BigDecimal aumInr;

    public NavSnapshotDto() {}

    public NavSnapshotDto(Long id, String basketId, BigDecimal nav, Instant recordedAt) {
        this.id = id;
        this.basketId = basketId;
        this.nav = nav;
        this.recordedAt = recordedAt;
    }

    public NavSnapshotDto(Long id, String basketId, BigDecimal nav, Instant recordedAt, BigDecimal change24h, BigDecimal aumInr) {
        this.id = id;
        this.basketId = basketId;
        this.nav = nav;
        this.recordedAt = recordedAt;
        this.change24h = change24h;
        this.aumInr = aumInr;
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

    public BigDecimal getChange24h() { return change24h; }
    public void setChange24h(BigDecimal change24h) { this.change24h = change24h; }

    public BigDecimal getAumInr() { return aumInr; }
    public void setAumInr(BigDecimal aumInr) { this.aumInr = aumInr; }
}
