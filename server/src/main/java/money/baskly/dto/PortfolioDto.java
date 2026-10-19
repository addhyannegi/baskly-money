package money.baskly.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PortfolioDto {
    private BigDecimal cashBalanceINR;
    private List<HoldingDto> holdings = new ArrayList<>();
    private List<MandateDto> mandates = new ArrayList<>();
    private List<TransactionDto> transactions = new ArrayList<>();
    private List<GrowthPointDto> growthHistory = new ArrayList<>();

    public PortfolioDto() {}

    public BigDecimal getCashBalanceINR() { return cashBalanceINR; }
    public void setCashBalanceINR(BigDecimal cashBalanceINR) { this.cashBalanceINR = cashBalanceINR; }

    public List<HoldingDto> getHoldings() { return holdings; }
    public void setHoldings(List<HoldingDto> holdings) { this.holdings = holdings; }

    public List<MandateDto> getMandates() { return mandates; }
    public void setMandates(List<MandateDto> mandates) { this.mandates = mandates; }

    public List<TransactionDto> getTransactions() { return transactions; }
    public void setTransactions(List<TransactionDto> transactions) { this.transactions = transactions; }

    public List<GrowthPointDto> getGrowthHistory() { return growthHistory; }
    public void setGrowthHistory(List<GrowthPointDto> growthHistory) { this.growthHistory = growthHistory; }
}
