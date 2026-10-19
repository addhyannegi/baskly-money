package money.baskly.dto;

import java.math.BigDecimal;

public class GrowthPointDto {
    private String month;
    private BigDecimal invested;
    private BigDecimal value;

    public GrowthPointDto() {}

    public GrowthPointDto(String month, BigDecimal invested, BigDecimal value) {
        this.month = month;
        this.invested = invested;
        this.value = value;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public BigDecimal getInvested() { return invested; }
    public void setInvested(BigDecimal invested) { this.invested = invested; }

    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
}
