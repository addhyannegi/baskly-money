package money.baskly.service;

import money.baskly.entity.BasketEntity;
import money.baskly.repository.BasketRepository;
import money.baskly.repository.SystemSettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Scheduled background pricing engine that polls constituent prices,
 * recalculates basket NAVs, and persists periodic historical snapshots.
 */
@Service
public class NavPricingScheduler {

    private static final Logger log = LoggerFactory.getLogger(NavPricingScheduler.class);

    private final BasketRepository basketRepository;
    private final BasketService basketService;
    private final NavEngineService navEngineService;
    private final PricingOracleService pricingOracleService;
    private final SystemSettingRepository systemSettingRepository;

    private final ReentrantLock cycleLock = new ReentrantLock();
    private final AtomicLong executionCount = new AtomicLong(0);
    private volatile Instant lastExecutionTime;

    public NavPricingScheduler(BasketRepository basketRepository,
                               BasketService basketService,
                               NavEngineService navEngineService,
                               PricingOracleService pricingOracleService,
                               SystemSettingRepository systemSettingRepository) {
        this.basketRepository = basketRepository;
        this.basketService = basketService;
        this.navEngineService = navEngineService;
        this.pricingOracleService = pricingOracleService;
        this.systemSettingRepository = systemSettingRepository;
    }

    /**
     * Periodic scheduled NAV calculation cycle.
     * Configurable via application properties with safe default of 60s.
     */
    @Scheduled(
            fixedRateString = "${app.nav.scheduler.fixed-rate-ms:60000}",
            initialDelayString = "${app.nav.scheduler.initial-delay-ms:5000}"
    )
    public boolean runNavUpdateCycle() {
        if (!cycleLock.tryLock()) {
            log.warn("[NavPricingScheduler] Previous NAV recalculation cycle is still active. Skipping overlapping run.");
            return false;
        }

        try {
            log.debug("[NavPricingScheduler] Starting periodic NAV update cycle #{}", executionCount.get() + 1);

            // 1. Check circuit breaker status
            boolean isCircuitBreakerActive = systemSettingRepository.findBySettingKey("circuit_breaker_active")
                    .map(s -> "true".equalsIgnoreCase(s.getSettingValue()))
                    .orElse(false);

            if (isCircuitBreakerActive) {
                log.warn("[NavPricingScheduler] System circuit breaker is ACTIVE. Freezing NAV updates.");
                return false;
            }

            // 2. Obtain current constituent prices
            Map<String, BigDecimal> currentPrices = pricingOracleService.getCurrentPrices();
            if (currentPrices == null || currentPrices.isEmpty()) {
                log.error("[NavPricingScheduler] No constituent pricing data available. Aborting cycle.");
                return false;
            }

            // 3. Retrieve all registered baskets
            List<BasketEntity> baskets = basketRepository.findAll();
            if (baskets.isEmpty()) {
                log.info("[NavPricingScheduler] No baskets registered in the system.");
                return true;
            }

            int updatedCount = 0;
            for (BasketEntity basket : baskets) {
                String basketId = basket.getId();
                if (!NavEngineService.BASKET_TARGET_WEIGHTS.containsKey(basketId)) {
                    log.debug("[NavPricingScheduler] Basket {} has no defined target weights; skipping.", basketId);
                    continue;
                }

                try {
                    BigDecimal calculatedNav = navEngineService.calculateBasketNav(basketId, currentPrices);
                    if (calculatedNav != null && calculatedNav.compareTo(BigDecimal.ZERO) > 0) {
                        basketService.updateNav(basketId, calculatedNav);
                        updatedCount++;
                        log.debug("[NavPricingScheduler] Recalculated NAV for {}: ₹{}", basketId, calculatedNav);
                    } else {
                        log.warn("[NavPricingScheduler] Calculation returned invalid NAV {} for basket {}", calculatedNav, basketId);
                    }
                } catch (Exception e) {
                    log.error("[NavPricingScheduler] Error calculating NAV for basket {}: {}", basketId, e.getMessage());
                }
            }

            executionCount.incrementAndGet();
            lastExecutionTime = Instant.now();
            log.info("[NavPricingScheduler] Completed NAV update cycle #{}: updated {} baskets", executionCount.get(), updatedCount);
            return true;
        } catch (Exception e) {
            log.error("[NavPricingScheduler] Unexpected failure during NAV recalculation cycle: {}", e.getMessage(), e);
            return false;
        } finally {
            cycleLock.unlock();
        }
    }

    public long getExecutionCount() {
        return executionCount.get();
    }

    public Instant getLastExecutionTime() {
        return lastExecutionTime;
    }

    public boolean isLocked() {
        return cycleLock.isLocked();
    }
}
