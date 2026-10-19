package money.baskly.service;

import money.baskly.dto.ManagerSummaryDto;
import money.baskly.dto.RebalanceLogDto;
import money.baskly.dto.RebalanceRequest;
import money.baskly.entity.BasketEntity;
import money.baskly.entity.PortfolioHoldingEntity;
import money.baskly.entity.RebalanceLogEntity;
import money.baskly.entity.SystemSettingEntity;
import money.baskly.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ManagerService {

    private final BasketRepository basketRepository;
    private final PortfolioHoldingRepository holdingRepository;
    private final UserRepository userRepository;
    private final RebalanceLogRepository rebalanceLogRepository;
    private final SystemSettingRepository systemSettingRepository;

    public ManagerService(BasketRepository basketRepository,
                          PortfolioHoldingRepository holdingRepository,
                          UserRepository userRepository,
                          RebalanceLogRepository rebalanceLogRepository,
                          SystemSettingRepository systemSettingRepository) {
        this.basketRepository = basketRepository;
        this.holdingRepository = holdingRepository;
        this.userRepository = userRepository;
        this.rebalanceLogRepository = rebalanceLogRepository;
        this.systemSettingRepository = systemSettingRepository;
    }

    @Transactional(readOnly = true)
    public ManagerSummaryDto getManagerSummary() {
        // Calculate Total AUM across all holdings
        List<PortfolioHoldingEntity> allHoldings = holdingRepository.findAll();
        BigDecimal totalAUM = BigDecimal.ZERO;

        for (PortfolioHoldingEntity h : allHoldings) {
            BigDecimal nav = basketRepository.findById(h.getBasketId())
                    .map(BasketEntity::getNav)
                    .orElse(h.getAvgBuyNav());
            BigDecimal val = h.getUnits().multiply(nav).setScale(2, RoundingMode.HALF_UP);
            totalAUM = totalAUM.add(val);
        }

        long verifiedInvestors = userRepository.count();

        boolean circuitBreaker = systemSettingRepository.findBySettingKey("circuit_breaker_active")
                .map(s -> "true".equalsIgnoreCase(s.getSettingValue()))
                .orElse(false);

        List<RebalanceLogDto> logs = rebalanceLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toRebalanceLogDto)
                .collect(Collectors.toList());

        ManagerSummaryDto summary = new ManagerSummaryDto();
        summary.setTotalAUM_INR(totalAUM);
        summary.setVerifiedInvestors(verifiedInvestors);
        summary.setCircuitBreakerActive(circuitBreaker);
        summary.setRebalanceLogs(logs);

        return summary;
    }

    @Transactional
    public boolean toggleCircuitBreaker() {
        SystemSettingEntity setting = systemSettingRepository.findBySettingKey("circuit_breaker_active")
                .orElse(new SystemSettingEntity("circuit_breaker_active", "false"));

        boolean current = "true".equalsIgnoreCase(setting.getSettingValue());
        boolean updated = !current;
        setting.setSettingValue(String.valueOf(updated));
        setting.setUpdatedAt(Instant.now());
        systemSettingRepository.save(setting);

        return updated;
    }

    @Transactional
    public RebalanceLogDto executeRebalance(RebalanceRequest request) {
        BasketEntity basket = basketRepository.findById(request.getBasketId())
                .orElseThrow(() -> new IllegalArgumentException("Basket not found: " + request.getBasketId()));

        String manager = request.getManagerName() != null && !request.getManagerName().isBlank()
                ? request.getManagerName()
                : "Automated Algorithmic Engine";

        int trades = basket.getConstituents() != null ? basket.getConstituents().size() : 4;
        BigDecimal slippage = new BigDecimal("0.0014"); // 0.14% avg slippage
        BigDecimal gasCost = new BigDecimal("128.40"); // ₹128.40 batch gas

        String logId = "reb_" + UUID.randomUUID().toString().substring(0, 8);
        String reason = "Market drift alignment back to institutional target weights for " + basket.getName();

        RebalanceLogEntity log = new RebalanceLogEntity(
                logId,
                basket.getId(),
                manager,
                trades,
                slippage,
                gasCost,
                "SUCCESS",
                reason
        );

        log = rebalanceLogRepository.save(log);
        return toRebalanceLogDto(log);
    }

    private RebalanceLogDto toRebalanceLogDto(RebalanceLogEntity log) {
        String basketName = basketRepository.findById(log.getBasketId())
                .map(BasketEntity::getName)
                .orElse(log.getBasketId());

        RebalanceLogDto dto = new RebalanceLogDto();
        dto.setId(log.getId());
        dto.setBasketId(log.getBasketId());
        dto.setBasketName(basketName);
        dto.setTimestamp(log.getCreatedAt().toString());
        dto.setManagerName(log.getManagerName());
        dto.setTradesExecuted(log.getTradesExecuted());
        dto.setSlippagePct(log.getSlippagePct());
        dto.setGasCostINR(log.getGasCostInr());
        dto.setStatus(log.getStatus());
        dto.setReason(log.getReason());
        return dto;
    }
}
