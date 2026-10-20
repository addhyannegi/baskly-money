package money.baskly.dto;

import java.math.BigDecimal;

public class BasketConstituentDto {
    private String symbol;
    private String name;
    private BigDecimal weight;
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

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public BigDecimal getPrice_inr() { return price_inr; }
    public void setPrice_inr(BigDecimal price_inr) { this.price_inr = price_inr; }
}
