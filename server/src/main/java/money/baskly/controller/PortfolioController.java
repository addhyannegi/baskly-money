package money.baskly.controller;

import jakarta.validation.Valid;
import money.baskly.dto.*;
import money.baskly.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
            @RequestParam(required = false) String userId,
            Authentication authentication) {
        String effectiveUserId = resolvePrincipalUserId(userId, authentication);
        PortfolioDto portfolio = portfolioService.getPortfolio(effectiveUserId);
        return ResponseEntity.ok(ApiResponse.ok(portfolio));
    }

    @PostMapping("/orders/buy")
    public ResponseEntity<ApiResponse<TransactionDto>> buyBasket(
            @Valid @RequestBody BuyOrderRequest request,
            Authentication authentication) {
        bindAuthenticatedUser(authentication, request::setUserId);
        TransactionDto tx = portfolioService.buyBasket(request);
        return ResponseEntity.ok(ApiResponse.ok("Buy order settled successfully", tx));
    }

    @PostMapping({"/orders/withdraw", "/orders/redeem"})
    public ResponseEntity<ApiResponse<WithdrawResponseDto>> withdrawBasket(
            @Valid @RequestBody WithdrawOrderRequest request,
            Authentication authentication) {
        bindAuthenticatedUser(authentication, request::setUserId);
        WithdrawResponseDto response = portfolioService.withdrawBasket(request);
        return ResponseEntity.ok(ApiResponse.ok("Withdrawal settled with 1% Section 194S TDS deduction", response));
    }

    @PostMapping({"/mandates", "/orders/sip"})
    public ResponseEntity<ApiResponse<MandateDto>> createMandate(
            @Valid @RequestBody MandateCreateRequest request,
            Authentication authentication) {
        bindAuthenticatedUser(authentication, request::setUserId);
        MandateDto mandate = portfolioService.createMandate(request);
        return ResponseEntity.ok(ApiResponse.ok("NPCI AutoPay mandate registered", mandate));
    }

    @PostMapping("/mandates/{id}/toggle")
    public ResponseEntity<ApiResponse<MandateDto>> toggleMandate(@PathVariable String id) {
        MandateDto updated = portfolioService.toggleMandate(id);
        return ResponseEntity.ok(ApiResponse.ok("Mandate status updated", updated));
    }

    private String resolvePrincipalUserId(String paramUserId, Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !("anonymousUser".equals(authentication.getName()))) {
            return authentication.getName();
        }
        if (paramUserId != null && !paramUserId.isBlank()) {
            return paramUserId;
        }
        return "usr_demo_retail";
    }

    private void bindAuthenticatedUser(Authentication authentication, java.util.function.Consumer<String> setter) {
        if (authentication != null && authentication.isAuthenticated() && !("anonymousUser".equals(authentication.getName()))) {
            setter.accept(authentication.getName());
        }
    }
}
