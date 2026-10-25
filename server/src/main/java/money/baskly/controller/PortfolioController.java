package money.baskly.controller;

import jakarta.validation.Valid;
import money.baskly.dto.*;
import money.baskly.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1", "/api"})
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/portfolio")
    public ResponseEntity<ApiResponse<PortfolioDto>> getPortfolio(
            @RequestParam(defaultValue = "usr_demo_retail") String userId) {
        PortfolioDto portfolio = portfolioService.getPortfolio(userId);
        return ResponseEntity.ok(ApiResponse.ok(portfolio));
    }

    @PostMapping("/orders/buy")
    public ResponseEntity<ApiResponse<TransactionDto>> buyBasket(
            @Valid @RequestBody BuyOrderRequest request) {
        TransactionDto tx = portfolioService.buyBasket(request);
        return ResponseEntity.ok(ApiResponse.ok("Buy order settled successfully", tx));
    }

    @PostMapping({"/orders/withdraw", "/orders/redeem"})
    public ResponseEntity<ApiResponse<WithdrawResponseDto>> withdrawBasket(
            @Valid @RequestBody WithdrawOrderRequest request) {
        WithdrawResponseDto response = portfolioService.withdrawBasket(request);
        return ResponseEntity.ok(ApiResponse.ok("Withdrawal settled with 1% Section 194S TDS deduction", response));
    }

    @PostMapping({"/mandates", "/orders/sip"})
    public ResponseEntity<ApiResponse<MandateDto>> createMandate(
            @Valid @RequestBody MandateCreateRequest request) {
        MandateDto mandate = portfolioService.createMandate(request);
        return ResponseEntity.ok(ApiResponse.ok("NPCI AutoPay mandate registered", mandate));
    }

    @PostMapping("/mandates/{id}/toggle")
    public ResponseEntity<ApiResponse<MandateDto>> toggleMandate(@PathVariable String id) {
        MandateDto updated = portfolioService.toggleMandate(id);
        return ResponseEntity.ok(ApiResponse.ok("Mandate status updated", updated));
    }
}
