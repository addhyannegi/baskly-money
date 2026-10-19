package money.baskly.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ManagerSummaryDto {
    private BigDecimal totalAUM_INR;
    private Long verifiedInvestors;
    private Boolean circuitBreakerActive;
    private List<RebalanceLogDto> rebalanceLogs = new ArrayList<>();

    public ManagerSummaryDto() {}

    public BigDecimal getTotalAUM_INR() { return totalAUM_INR; }
    public void setTotalAUM_INR(BigDecimal totalAUM_INR) { this.totalAUM_INR = totalAUM_INR; }

    public Long getVerifiedInvestors() { return verifiedInvestors; }
    public void setVerifiedInvestors(Long verifiedInvestors) { this.verifiedInvestors = verifiedInvestors; }

    public Boolean getCircuitBreakerActive() { return circuitBreakerActive; }
    public void setCircuitBreakerActive(Boolean circuitBreakerActive) { this.circuitBreakerActive = circuitBreakerActive; }

    public List<RebalanceLogDto> getRebalanceLogs() { return rebalanceLogs; }
    public void setRebalanceLogs(List<RebalanceLogDto> rebalanceLogs) { this.rebalanceLogs = rebalanceLogs; }
}
