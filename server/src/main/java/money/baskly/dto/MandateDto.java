package money.baskly.dto;

import java.math.BigDecimal;

public class MandateDto {
    private String id;
    private String basketId;
    private String basketName;
    private BigDecimal monthlyAmountINR;
    private Integer debitDay;
    private String status;
    private String vpa;
    private String nextDebitDate;

    public MandateDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public String getBasketName() { return basketName; }
    public void setBasketName(String basketName) { this.basketName = basketName; }

    public BigDecimal getMonthlyAmountINR() { return monthlyAmountINR; }
    public void setMonthlyAmountINR(BigDecimal monthlyAmountINR) { this.monthlyAmountINR = monthlyAmountINR; }

    public Integer getDebitDay() { return debitDay; }
    public void setDebitDay(Integer debitDay) { this.debitDay = debitDay; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getVpa() { return vpa; }
    public void setVpa(String vpa) { this.vpa = vpa; }

    public String getNextDebitDate() { return nextDebitDate; }
    public void setNextDebitDate(String nextDebitDate) { this.nextDebitDate = nextDebitDate; }
}
