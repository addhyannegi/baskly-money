package money.baskly.dto;

import java.math.BigDecimal;

public class TransactionDto {
    private String id;
    private String timestamp;
    private String type; // BUY | WITHDRAWAL
    private String basketId;
    private String basketName;
    private BigDecimal amountINR;
    private BigDecimal units;
    private BigDecimal nav;
    private BigDecimal tdsINR;
    private BigDecimal netAmountINR;
    private String status;
    private String bankRef;

    public TransactionDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public String getBasketName() { return basketName; }
    public void setBasketName(String basketName) { this.basketName = basketName; }

    public BigDecimal getAmountINR() { return amountINR; }
    public void setAmountINR(BigDecimal amountINR) { this.amountINR = amountINR; }

    public BigDecimal getUnits() { return units; }
    public void setUnits(BigDecimal units) { this.units = units; }

    public BigDecimal getNav() { return nav; }
    public void setNav(BigDecimal nav) { this.nav = nav; }

    public BigDecimal getTdsINR() { return tdsINR; }
    public void setTdsINR(BigDecimal tdsINR) { this.tdsINR = tdsINR; }

    public BigDecimal getNetAmountINR() { return netAmountINR; }
    public void setNetAmountINR(BigDecimal netAmountINR) { this.netAmountINR = netAmountINR; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBankRef() { return bankRef; }
    public void setBankRef(String bankRef) { this.bankRef = bankRef; }
}
