package money.baskly.dto;

import java.math.BigDecimal;

public class HoldingDto {
    private String basketId;
    private String basketName;
    private BigDecimal units;
    private BigDecimal avgBuyNav;
    private BigDecimal investedAmountINR;
    private String purchasedDate;
    private BigDecimal liveNav;
    private BigDecimal currentValueINR;
    private BigDecimal profitINR;
    private BigDecimal returnPct;

    public HoldingDto() {}

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public String getBasketName() { return basketName; }
    public void setBasketName(String basketName) { this.basketName = basketName; }

    public BigDecimal getUnits() { return units; }
    public void setUnits(BigDecimal units) { this.units = units; }

    public BigDecimal getAvgBuyNav() { return avgBuyNav; }
    public void setAvgBuyNav(BigDecimal avgBuyNav) { this.avgBuyNav = avgBuyNav; }

    public BigDecimal getInvestedAmountINR() { return investedAmountINR; }
    public void setInvestedAmountINR(BigDecimal investedAmountINR) { this.investedAmountINR = investedAmountINR; }

    public String getPurchasedDate() { return purchasedDate; }
    public void setPurchasedDate(String purchasedDate) { this.purchasedDate = purchasedDate; }

    public BigDecimal getLiveNav() { return liveNav; }
    public void setLiveNav(BigDecimal liveNav) { this.liveNav = liveNav; }

    public BigDecimal getCurrentValueINR() { return currentValueINR; }
    public void setCurrentValueINR(BigDecimal currentValueINR) { this.currentValueINR = currentValueINR; }

    public BigDecimal getProfitINR() { return profitINR; }
    public void setProfitINR(BigDecimal profitINR) { this.profitINR = profitINR; }

    public BigDecimal getReturnPct() { return returnPct; }
    public void setReturnPct(BigDecimal returnPct) { this.returnPct = returnPct; }
}
