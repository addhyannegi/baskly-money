package money.baskly.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class MandateCreateRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Basket ID is required")
    private String basketId;

    @NotNull(message = "Monthly SIP amount is required")
    @DecimalMin(value = "500.00", message = "Minimum SIP amount is ₹500")
    private BigDecimal monthlyAmountInr;

    @NotNull(message = "Debit day is required")
    @Min(value = 1, message = "Debit day must be at least 1")
    @Max(value = 31, message = "Debit day must be at most 31")
    private Integer debitDay;

    @NotBlank(message = "VPA is required")
    private String vpa;

    public MandateCreateRequest() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public BigDecimal getMonthlyAmountInr() { return monthlyAmountInr; }
    public void setMonthlyAmountInr(BigDecimal monthlyAmountInr) { this.monthlyAmountInr = monthlyAmountInr; }

    public Integer getDebitDay() { return debitDay; }
    public void setDebitDay(Integer debitDay) { this.debitDay = debitDay; }

    public String getVpa() { return vpa; }
    public void setVpa(String vpa) { this.vpa = vpa; }
}
