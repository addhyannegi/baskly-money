package money.baskly.service;

import money.baskly.entity.BasketEntity;
import money.baskly.entity.NavSnapshotEntity;
import money.baskly.entity.SystemSettingEntity;
import money.baskly.repository.BasketRepository;
import money.baskly.repository.NavSnapshotRepository;
import money.baskly.repository.SystemSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class NavSchedulerTest {

    @Autowired
    private BasketRepository basketRepository;

    @Autowired
    private NavSnapshotRepository navSnapshotRepository;

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Autowired
    private PricingOracleService pricingOracleService;

    @Autowired
    private NavPricingScheduler navPricingScheduler;

    private static final String BASKET_ID = "top-5-index";

    @BeforeEach
    void setUp() {
        navSnapshotRepository.deleteAll();

        // Ensure circuit breaker is inactive
        SystemSettingEntity cb = systemSettingRepository.findBySettingKey("circuit_breaker_active")
                .orElse(new SystemSettingEntity("circuit_breaker_active", "false"));
        cb.setSettingValue("false");
        systemSettingRepository.save(cb);

        // Ensure top-5-index basket exists with all required fields
        if (!basketRepository.existsById(BASKET_ID)) {
            BasketEntity b = new BasketEntity();
            b.setId(BASKET_ID);
            b.setIndexNum("01");
            b.setName("Top-5 Bluechip Index");
            b.setSerifWord("Bluechip");
            b.setTagline("Top 5 digital assets");
            b.setDescription("Market cap weighted");
            b.setRisk("Balanced Core");
            b.setRiskColor("#0F6E56");
            b.setFeePct(new BigDecimal("1.25"));
            b.setMinSip(new BigDecimal("1000.00"));
            b.setExpectedCagr(new BigDecimal("28.5"));
            b.setNav(new BigDecimal("100.0000"));
            b.setChange24h(BigDecimal.ZERO);
            basketRepository.save(b);
        }

        pricingOracleService.resetToBaseline();
    }

    @Test
    @DisplayName("Verify Scheduled Cycle computes NAV from prices and persists a snapshot")
    void testSuccessfulCycleUpdatesNavAndPersistsSnapshot() {
        // Change BTC price from 81604 to 90000 to trigger a real NAV change
        pricingOracleService.updatePrice("BTC", new BigDecimal("90000"));

        boolean result = navPricingScheduler.runNavUpdateCycle();
        assertTrue(result, "Cycle must complete successfully");

        // Verify basket NAV updated in database
        BasketEntity updatedBasket = basketRepository.findById(BASKET_ID).orElseThrow();
        assertNotEquals(new BigDecimal("100.0000"), updatedBasket.getNav());
        assertTrue(updatedBasket.getNav().compareTo(new BigDecimal("100.00")) > 0, "NAV should increase when BTC rises");

        // Verify snapshot was persisted
        List<NavSnapshotEntity> snapshots = navSnapshotRepository.findByBasketIdOrderByRecordedAtAsc(BASKET_ID);
        assertFalse(snapshots.isEmpty(), "Snapshot must be persisted");
        assertEquals(0, updatedBasket.getNav().compareTo(snapshots.get(snapshots.size() - 1).getNav()));
    }

    @Test
    @DisplayName("Verify Circuit Breaker freezes scheduled NAV updates")
    void testCircuitBreakerFreezesNavRecalculation() {
        SystemSettingEntity cb = systemSettingRepository.findBySettingKey("circuit_breaker_active").orElseThrow();
        cb.setSettingValue("true");
        systemSettingRepository.save(cb);

        int initialSnapshotCount = navSnapshotRepository.findByBasketIdOrderByRecordedAtAsc(BASKET_ID).size();

        boolean executed = navPricingScheduler.runNavUpdateCycle();
        assertFalse(executed, "Cycle must abort when circuit breaker is active");

        int finalSnapshotCount = navSnapshotRepository.findByBasketIdOrderByRecordedAtAsc(BASKET_ID).size();
        assertEquals(initialSnapshotCount, finalSnapshotCount, "No new snapshots should be written while frozen");
    }

    @Test
    @DisplayName("Verify Thread Safety: cycleLock prevents overlapping calculation cycles from another thread")
    void testReentrantLockPreventsOverlappingCycles() throws Exception {
        Field lockField = NavPricingScheduler.class.getDeclaredField("cycleLock");
        lockField.setAccessible(true);
        ReentrantLock lock = (ReentrantLock) lockField.get(navPricingScheduler);

        CountDownLatch threadAcquiredLock = new CountDownLatch(1);
        CountDownLatch releaseLock = new CountDownLatch(1);

        Thread competingThread = new Thread(() -> {
            lock.lock();
            try {
                threadAcquiredLock.countDown();
                releaseLock.await(5, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                lock.unlock();
            }
        });

        competingThread.start();
        assertTrue(threadAcquiredLock.await(2, TimeUnit.SECONDS), "Other thread must acquire the lock");

        try {
            boolean executed = navPricingScheduler.runNavUpdateCycle();
            assertFalse(executed, "Concurrent cycle must be rejected when competing thread holds the lock");
        } finally {
            releaseLock.countDown();
            competingThread.join(2000);
        }
    }

    @Test
    @DisplayName("Verify PricingOracleService live refresh feeds prices and handles network gracefully")
    void testLivePriceRefreshGracefulHandling() {
        // When live fetching is disabled (in test profile), returns 0 safely without error
        int countDisabled = pricingOracleService.refreshMarketPrices();
        assertEquals(0, countDisabled);

        // When live fetching is enabled, attempts update and safely catches any network exceptions without throwing
        pricingOracleService.setFetchLivePrices(true);
        assertDoesNotThrow(() -> {
            pricingOracleService.refreshMarketPrices();
        });
        pricingOracleService.setFetchLivePrices(false);
    }
}
