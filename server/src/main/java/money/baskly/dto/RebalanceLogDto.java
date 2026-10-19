package money.baskly.dto;

import java.math.BigDecimal;

public class RebalanceLogDto {
    private String id;
    private String basketId;
    private String basketName;
    private String timestamp;
    private String managerName;
    private Integer tradesExecuted;
    private BigDecimal slippagePct;
    private BigDecimal gasCostINR;
    private String status;
    private String reason;

    public RebalanceLogDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public String getBasketName() { return basketName; }
    public void setBasketName(String basketName) { this.basketName = basketName; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public Integer getTradesExecuted() { return tradesExecuted; }
    public void setTradesExecuted(Integer tradesExecuted) { this.tradesExecuted = tradesExecuted; }

    public BigDecimal getSlippagePct() { return slippagePct; }
    public void setSlippagePct(BigDecimal slippagePct) { this.slippagePct = slippagePct; }

    public BigDecimal getGasCostINR() { return gasCostINR; }
    public void setGasCostINR(BigDecimal gasCostINR) { this.gasCostINR = gasCostINR; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
