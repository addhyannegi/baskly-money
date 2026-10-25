package money.baskly.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_transactions_user", columnList = "user_id, created_at DESC")
})
public class TransactionEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;

    @Column(name = "basket_id", length = 64, nullable = false)
    private String basketId;

    @Column(name = "type", length = 32, nullable = false)
    private String type; // 'BUY' | 'WITHDRAWAL'

    @Column(name = "amount_inr", precision = 18, scale = 2, nullable = false)
    private BigDecimal amountInr;

    @Column(name = "units", precision = 18, scale = 6, nullable = false)
    private BigDecimal units;

    @Column(name = "nav", precision = 15, scale = 4, nullable = false)
    private BigDecimal nav;

    @Column(name = "tds_inr", precision = 18, scale = 2, nullable = false)
    private BigDecimal tdsInr = BigDecimal.ZERO;

    @Column(name = "net_amount_inr", precision = 18, scale = 2, nullable = false)
    private BigDecimal netAmountInr;

    @Column(name = "status", length = 32, nullable = false)
    private String status = "SETTLED";

    @Column(name = "bank_ref", length = 128)
    private String bankRef;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public TransactionEntity() {}

    public TransactionEntity(String id, String userId, String basketId, String type, BigDecimal amountInr, 
                             BigDecimal units, BigDecimal nav, BigDecimal tdsInr, BigDecimal netAmountInr, 
                             String status, String bankRef) {
        this.id = id;
        this.userId = userId;
        this.basketId = basketId;
        this.type = type;
        this.amountInr = amountInr;
        this.units = units;
        this.nav = nav;
        this.tdsInr = tdsInr != null ? tdsInr : BigDecimal.ZERO;
        this.netAmountInr = netAmountInr;
        this.status = status != null ? status : "SETTLED";
        this.bankRef = bankRef;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public String getFundId() { return basketId; }
    public void setFundId(String fundId) { this.basketId = fundId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getAmountInr() { return amountInr; }
    public void setAmountInr(BigDecimal amountInr) { this.amountInr = amountInr; }

    public BigDecimal getInvestedAmountInr() { return amountInr; }

    public BigDecimal getUnits() { return units; }
    public void setUnits(BigDecimal units) { this.units = units; }

    public BigDecimal getNav() { return nav; }
    public void setNav(BigDecimal nav) { this.nav = nav; }

    public BigDecimal getTdsInr() { return tdsInr; }
    public void setTdsInr(BigDecimal tdsInr) { this.tdsInr = tdsInr; }

    public BigDecimal getNetAmountInr() { return netAmountInr; }
    public void setNetAmountInr(BigDecimal netAmountInr) { this.netAmountInr = netAmountInr; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBankRef() { return bankRef; }
    public void setBankRef(String bankRef) { this.bankRef = bankRef; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
