package money.baskly.controller;

import money.baskly.dto.ApiResponse;
import money.baskly.dto.BasketDto;
import money.baskly.service.BasketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/baskets")
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
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/nav")
    public ResponseEntity<ApiResponse<BasketDto>> updateNav(@PathVariable String id, @RequestBody Map<String, BigDecimal> body) {
        BigDecimal newNav = body.get("nav");
        if (newNav == null || newNav.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Valid positive NAV value is required"));
        }
        BasketDto updated = basketService.updateNav(id, newNav);
        return ResponseEntity.ok(ApiResponse.ok("NAV updated successfully", updated));
    }
}
