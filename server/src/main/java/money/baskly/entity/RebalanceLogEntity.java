package money.baskly.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "rebalance_logs")
public class RebalanceLogEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "basket_id", length = 64, nullable = false)
    private String basketId;

    @Column(name = "manager_name", length = 128, nullable = false)
    private String managerName;

    @Column(name = "trades_executed", nullable = false)
    private Integer tradesExecuted = 0;

    @Column(name = "slippage_pct", precision = 6, scale = 4, nullable = false)
    private BigDecimal slippagePct = BigDecimal.ZERO;

    @Column(name = "gas_cost_inr", precision = 15, scale = 2, nullable = false)
    private BigDecimal gasCostInr = BigDecimal.ZERO;

    @Column(name = "status", length = 32, nullable = false)
    private String status = "SUCCESS";

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public RebalanceLogEntity() {}

    public RebalanceLogEntity(String id, String basketId, String managerName, Integer tradesExecuted, 
                              BigDecimal slippagePct, BigDecimal gasCostInr, String status, String reason) {
        this.id = id;
        this.basketId = basketId;
        this.managerName = managerName;
        this.tradesExecuted = tradesExecuted != null ? tradesExecuted : 0;
        this.slippagePct = slippagePct != null ? slippagePct : BigDecimal.ZERO;
        this.gasCostInr = gasCostInr != null ? gasCostInr : BigDecimal.ZERO;
        this.status = status != null ? status : "SUCCESS";
        this.reason = reason;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public Integer getTradesExecuted() { return tradesExecuted; }
    public void setTradesExecuted(Integer tradesExecuted) { this.tradesExecuted = tradesExecuted; }

    public BigDecimal getSlippagePct() { return slippagePct; }
    public void setSlippagePct(BigDecimal slippagePct) { this.slippagePct = slippagePct; }

    public BigDecimal getGasCostInr() { return gasCostInr; }
    public void setGasCostInr(BigDecimal gasCostInr) { this.gasCostInr = gasCostInr; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
