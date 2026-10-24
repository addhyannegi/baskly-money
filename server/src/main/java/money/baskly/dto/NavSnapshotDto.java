package money.baskly.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class NavSnapshotDto {
    private Long id;
    private String basketId;
    private BigDecimal nav;
    private Instant recordedAt;

    public NavSnapshotDto() {}

    public NavSnapshotDto(Long id, String basketId, BigDecimal nav, Instant recordedAt) {
        this.id = id;
        this.basketId = basketId;
        this.nav = nav;
        this.recordedAt = recordedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public BigDecimal getNav() { return nav; }
    public void setNav(BigDecimal nav) { this.nav = nav; }

    public Instant getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }
}
