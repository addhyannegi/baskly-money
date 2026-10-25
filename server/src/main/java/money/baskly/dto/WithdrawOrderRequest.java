package money.baskly.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class WithdrawOrderRequest {

    private String userId;
    private String basketId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "100.00", message = "Minimum withdrawal amount is ₹100")
    private BigDecimal amountInr;

    public WithdrawOrderRequest() {}

    public WithdrawOrderRequest(String userId, String basketId, BigDecimal amountInr) {
        this.userId = userId;
        this.basketId = basketId;
        this.amountInr = amountInr;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getBasketId() { 
        return basketId; 
    }
    public void setBasketId(String basketId) { 
        this.basketId = basketId; 
    }

    public String getFundId() { 
        return basketId; 
    }
    public void setFundId(String fundId) { 
        this.basketId = fundId; 
    }

    public BigDecimal getAmountInr() { return amountInr; }
    public void setAmountInr(BigDecimal amountInr) { this.amountInr = amountInr; }
}
