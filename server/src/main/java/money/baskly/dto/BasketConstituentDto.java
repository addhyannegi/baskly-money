package money.baskly.dto;

import java.math.BigDecimal;

public class BasketConstituentDto {
    private String symbol;
    private String name;
    private BigDecimal weight;
    private BigDecimal rebalance_drift_threshold = new BigDecimal("5.00");
    private String color;
    private BigDecimal price_inr;

    public BasketConstituentDto() {}

    public BasketConstituentDto(String symbol, String name, BigDecimal weight, String color, BigDecimal price_inr) {
        this.symbol = symbol;
        this.name = name;
        this.weight = weight;
        this.color = color;
        this.price_inr = price_inr;
    }

    public BasketConstituentDto(String symbol, String name, BigDecimal weight, BigDecimal rebalance_drift_threshold, String color, BigDecimal price_inr) {
        this.symbol = symbol;
        this.name = name;
        this.weight = weight;
        this.rebalance_drift_threshold = rebalance_drift_threshold;
        this.color = color;
        this.price_inr = price_inr;
    }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public BigDecimal getTargetWeight() { return weight; }
    public void setTargetWeight(BigDecimal targetWeight) { this.weight = targetWeight; }

    public BigDecimal getRebalance_drift_threshold() { return rebalance_drift_threshold; }
    public void setRebalance_drift_threshold(BigDecimal threshold) { 
        this.rebalance_drift_threshold = threshold != null ? threshold : new BigDecimal("5.00"); 
    }

    public BigDecimal getRebalanceDriftThreshold() { return rebalance_drift_threshold; }
    public void setRebalanceDriftThreshold(BigDecimal threshold) { 
        this.rebalance_drift_threshold = threshold != null ? threshold : new BigDecimal("5.00"); 
    }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public BigDecimal getPrice_inr() { return price_inr; }
    public void setPrice_inr(BigDecimal price_inr) { this.price_inr = price_inr; }
}
