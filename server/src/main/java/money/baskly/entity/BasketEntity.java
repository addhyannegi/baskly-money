package money.baskly.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "baskets")
public class BasketEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "index_num", length = 16, nullable = false)
    private String indexNum;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "serif_word", length = 64, nullable = false)
    private String serifWord;

    @Column(name = "tagline", length = 512, nullable = false)
    private String tagline;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "risk", length = 64, nullable = false)
    private String risk;

    @Column(name = "risk_color", length = 32, nullable = false)
    private String riskColor;

    @Column(name = "fee_pct", precision = 6, scale = 2, nullable = false)
    private BigDecimal feePct = new BigDecimal("1.00");

    @Column(name = "min_sip", precision = 15, scale = 2, nullable = false)
    private BigDecimal minSip = new BigDecimal("1000.00");

    @Column(name = "expected_cagr", precision = 6, scale = 2, nullable = false)
    private BigDecimal expectedCagr;

    @Column(name = "nav", precision = 15, scale = 4, nullable = false)
    private BigDecimal nav = new BigDecimal("100.0000");

    @Column(name = "change_24h", precision = 6, scale = 2, nullable = false)
    private BigDecimal change24h = BigDecimal.ZERO;

    @Column(name = "rebalance_drift_threshold", precision = 6, scale = 2, nullable = false)
    private BigDecimal rebalanceDriftThreshold = new BigDecimal("5.00");

    @OneToMany(mappedBy = "basket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<BasketConstituentEntity> constituents = new ArrayList<>();

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public BasketEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFundId() { return id; }
    public void setFundId(String fundId) { this.id = fundId; }

    public String getIndexNum() { return indexNum; }
    public void setIndexNum(String indexNum) { this.indexNum = indexNum; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSerifWord() { return serifWord; }
    public void setSerifWord(String serifWord) { this.serifWord = serifWord; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRisk() { return risk; }
    public void setRisk(String risk) { this.risk = risk; }

    public String getRiskColor() { return riskColor; }
    public void setRiskColor(String riskColor) { this.riskColor = riskColor; }

    public BigDecimal getFeePct() { return feePct; }
    public void setFeePct(BigDecimal feePct) { this.feePct = feePct; }

    public BigDecimal getMinSip() { return minSip; }
    public void setMinSip(BigDecimal minSip) { this.minSip = minSip; }

    public BigDecimal getExpectedCagr() { return expectedCagr; }
    public void setExpectedCagr(BigDecimal expectedCagr) { this.expectedCagr = expectedCagr; }

    public BigDecimal getNav() { return nav; }
    public void setNav(BigDecimal nav) { this.nav = nav; }

    public BigDecimal getChange24h() { return change24h; }
    public void setChange24h(BigDecimal change24h) { this.change24h = change24h; }

    public BigDecimal getRebalanceDriftThreshold() { return rebalanceDriftThreshold; }
    public void setRebalanceDriftThreshold(BigDecimal rebalanceDriftThreshold) { 
        this.rebalanceDriftThreshold = rebalanceDriftThreshold != null ? rebalanceDriftThreshold : new BigDecimal("5.00"); 
    }

    public List<BasketConstituentEntity> getConstituents() { return constituents; }
    public void setConstituents(List<BasketConstituentEntity> constituents) { this.constituents = constituents; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
