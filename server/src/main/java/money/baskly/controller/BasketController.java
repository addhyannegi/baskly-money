package money.baskly.controller;

import money.baskly.dto.ApiResponse;
import money.baskly.dto.BasketDto;
import money.baskly.dto.NavSnapshotDto;
import money.baskly.service.BasketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/baskets", "/api/v1/funds", "/api/baskets", "/api/funds"})
public class BasketController {

    private final BasketService basketService;

    public BasketController(BasketService basketService) {
        this.basketService = basketService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BasketDto>>> getAllBaskets() {
        List<BasketDto> baskets = basketService.getAllBaskets();
        return ResponseEntity.ok(ApiResponse.ok(baskets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BasketDto>> getBasketById(@PathVariable String id) {
        return basketService.getBasketById(id)
                .map(b -> ResponseEntity.ok(ApiResponse.ok(b)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Basket not found: " + id)));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<NavSnapshotDto>>> getBasketHistory(
            @PathVariable String id,
            @RequestParam(defaultValue = "1D") String interval) {
        if (!basketService.basketExists(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Basket not found: " + id));
        }

        try {
            List<NavSnapshotDto> history = basketService.getNavHistory(id, interval);
            return ResponseEntity.ok(ApiResponse.ok(history));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping({"/{id}/nav-history", "/{id}/nav"})
    public ResponseEntity<ApiResponse<List<NavSnapshotDto>>> getBasketNavHistory(
            @PathVariable String id,
            @RequestParam(defaultValue = "1D") String interval) {
        return getBasketHistory(id, interval);
    }

    @PostMapping("/{id}/nav")
    @PreAuthorize("hasAnyRole('FUND_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BasketDto>> updateNav(@PathVariable String id, @RequestBody Map<String, BigDecimal> body) {
        if (!basketService.basketExists(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Basket not found: " + id));
        }

        BigDecimal newNav = body.get("nav");
        if (newNav == null || newNav.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Valid positive NAV value is required"));
        }
        try {
            BasketDto updated = basketService.updateNav(id, newNav);
            return ResponseEntity.ok(ApiResponse.ok("NAV updated successfully", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
