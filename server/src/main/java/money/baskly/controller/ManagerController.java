package money.baskly.controller;

import jakarta.validation.Valid;
import money.baskly.dto.ApiResponse;
import money.baskly.dto.ManagerSummaryDto;
import money.baskly.dto.RebalanceLogDto;
import money.baskly.dto.RebalanceRequest;
import money.baskly.service.ManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/manager", "/api/manager"})
public class ManagerController {

    private final ManagerService managerService;

    public ManagerController(ManagerService managerService) {
        this.managerService = managerService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ManagerSummaryDto>> getSummary() {
        ManagerSummaryDto summary = managerService.getManagerSummary();
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @PostMapping("/circuit-breaker")
    public ResponseEntity<ApiResponse<Boolean>> toggleCircuitBreaker() {
        boolean active = managerService.toggleCircuitBreaker();
        String msg = active ? "EMERGENCY: Circuit breaker activated. All withdrawals halted." : "Circuit breaker deactivated. Trading normal.";
        return ResponseEntity.ok(ApiResponse.ok(msg, active));
    }

    @PostMapping("/rebalance")
    public ResponseEntity<ApiResponse<RebalanceLogDto>> executeRebalance(
            @Valid @RequestBody RebalanceRequest request) {
        RebalanceLogDto log = managerService.executeRebalance(request);
        return ResponseEntity.ok(ApiResponse.ok("Rebalance executed and logged successfully", log));
    }
}
