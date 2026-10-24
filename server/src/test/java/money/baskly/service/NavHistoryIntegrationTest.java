package money.baskly.service;

import money.baskly.dto.NavSnapshotDto;
import money.baskly.entity.BasketEntity;
import money.baskly.entity.NavSnapshotEntity;
import money.baskly.repository.BasketRepository;
import money.baskly.repository.NavSnapshotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class NavHistoryIntegrationTest {

    @Autowired
    private BasketRepository basketRepository;

    @Autowired
    private NavSnapshotRepository navSnapshotRepository;

    @Autowired
    private BasketService basketService;

    private static final String TEST_BASKET_1 = "test-bluechip";
    private static final String TEST_BASKET_2 = "test-defi";

    private BasketEntity createTestBasket(String id, String name) {
        BasketEntity b = new BasketEntity();
        b.setId(id);
        b.setIndexNum("01");
        b.setName(name);
        b.setSerifWord("Core");
        b.setTagline("Test Tagline");
        b.setDescription("Test Description");
        b.setRisk("Moderate");
        b.setRiskColor("#0F6E56");
        b.setFeePct(new BigDecimal("1.25"));
        b.setMinSip(new BigDecimal("1000.00"));
        b.setExpectedCagr(new BigDecimal("28.5"));
        b.setNav(new BigDecimal("100.0000"));
        b.setChange24h(BigDecimal.ZERO);
        return b;
    }

    @BeforeEach
    void setUp() {
        navSnapshotRepository.deleteAll();

        if (!basketRepository.existsById(TEST_BASKET_1)) {
            basketRepository.save(createTestBasket(TEST_BASKET_1, "Test Bluechip"));
        } else {
            BasketEntity b1 = basketRepository.findById(TEST_BASKET_1).orElseThrow();
            b1.setNav(new BigDecimal("100.0000"));
            b1.setChange24h(BigDecimal.ZERO);
            basketRepository.save(b1);
        }

        if (!basketRepository.existsById(TEST_BASKET_2)) {
            basketRepository.save(createTestBasket(TEST_BASKET_2, "Test DeFi"));
        } else {
            BasketEntity b2 = basketRepository.findById(TEST_BASKET_2).orElseThrow();
            b2.setNav(new BigDecimal("100.0000"));
            b2.setChange24h(BigDecimal.ZERO);
            basketRepository.save(b2);
        }
    }

    @Test
    @DisplayName("Verify Baseline ₹100.00 initialization persists a valid snapshot")
    void testBaselineSeeding() {
        basketService.ensureBaselineSnapshotsExist();

        List<NavSnapshotEntity> b1Snapshots = navSnapshotRepository.findByBasketIdOrderByRecordedAtAsc(TEST_BASKET_1);
        assertFalse(b1Snapshots.isEmpty(), "Baseline snapshot should exist for basket 1");
        assertEquals(0, new BigDecimal("100.00").compareTo(b1Snapshots.get(0).getNav()));
    }

    @Test
    @DisplayName("Verify Historical Snapshots across 1D, 1W, 1M, 1Y, and 5Y intervals")
    void testHistoricalIntervalQueries() {
        Instant now = Instant.now();

        // Seed snapshots across different timeframes
        navSnapshotRepository.save(new NavSnapshotEntity(TEST_BASKET_1, new BigDecimal("95.00"), now.minus(2, ChronoUnit.HOURS)));
        navSnapshotRepository.save(new NavSnapshotEntity(TEST_BASKET_1, new BigDecimal("98.50"), now.minus(3, ChronoUnit.DAYS)));
        navSnapshotRepository.save(new NavSnapshotEntity(TEST_BASKET_1, new BigDecimal("102.00"), now.minus(15, ChronoUnit.DAYS)));
        navSnapshotRepository.save(new NavSnapshotEntity(TEST_BASKET_1, new BigDecimal("110.00"), now.minus(100, ChronoUnit.DAYS)));
        navSnapshotRepository.save(new NavSnapshotEntity(TEST_BASKET_1, new BigDecimal("120.00"), now.minus(700, ChronoUnit.DAYS)));

        // 1D: should only have the snapshot from 2 hours ago
        List<NavSnapshotDto> h1d = basketService.getNavHistory(TEST_BASKET_1, "1D");
        assertEquals(1, h1d.size(), "1D should return snapshots within 24 hours");
        assertEquals(0, new BigDecimal("95.00").compareTo(h1d.get(0).getNav()));

        // 1W: should include 2 hours and 3 days ago
        List<NavSnapshotDto> h1w = basketService.getNavHistory(TEST_BASKET_1, "1W");
        assertEquals(2, h1w.size(), "1W should return snapshots within 7 days");

        // 1M: should include 2 hours, 3 days, and 15 days ago
        List<NavSnapshotDto> h1m = basketService.getNavHistory(TEST_BASKET_1, "1M");
        assertEquals(3, h1m.size(), "1M should return snapshots within 30 days");

        // 1Y: should include up to 100 days ago
        List<NavSnapshotDto> h1y = basketService.getNavHistory(TEST_BASKET_1, "1Y");
        assertEquals(4, h1y.size(), "1Y should return snapshots within 365 days");

        // 5Y: should include all 5 snapshots up to 700 days ago
        List<NavSnapshotDto> h5y = basketService.getNavHistory(TEST_BASKET_1, "5Y");
        assertEquals(5, h5y.size(), "5Y should return snapshots within 1825 days");

        // Verify chronological ascending order
        for (int i = 0; i < h5y.size() - 1; i++) {
            assertTrue(h5y.get(i).getRecordedAt().isBefore(h5y.get(i + 1).getRecordedAt())
                    || h5y.get(i).getRecordedAt().equals(h5y.get(i + 1).getRecordedAt()),
                    "Snapshots must be ordered chronologically ascending");
        }
    }

    @Test
    @DisplayName("Verify Basket Isolation: queries for one basket never return another basket's snapshots")
    void testBasketIsolation() {
        Instant now = Instant.now();
        navSnapshotRepository.save(new NavSnapshotEntity(TEST_BASKET_1, new BigDecimal("105.00"), now.minus(1, ChronoUnit.HOURS)));
        navSnapshotRepository.save(new NavSnapshotEntity(TEST_BASKET_2, new BigDecimal("85.00"), now.minus(1, ChronoUnit.HOURS)));

        List<NavSnapshotDto> b1History = basketService.getNavHistory(TEST_BASKET_1, "1D");
        List<NavSnapshotDto> b2History = basketService.getNavHistory(TEST_BASKET_2, "1D");

        assertEquals(1, b1History.size());
        assertEquals(TEST_BASKET_1, b1History.get(0).getBasketId());
        assertEquals(0, new BigDecimal("105.00").compareTo(b1History.get(0).getNav()));

        assertEquals(1, b2History.size());
        assertEquals(TEST_BASKET_2, b2History.get(0).getBasketId());
        assertEquals(0, new BigDecimal("85.00").compareTo(b2History.get(0).getNav()));
    }

    @Test
    @DisplayName("Verify Fallback when interval has no new snapshots: returns latest available snapshot")
    void testFallbackToLatestAvailableSnapshot() {
        Instant twoMonthsAgo = Instant.now().minus(60, ChronoUnit.DAYS);
        navSnapshotRepository.save(new NavSnapshotEntity(TEST_BASKET_1, new BigDecimal("112.50"), twoMonthsAgo));

        // Query 1D where no snapshot exists in the last 24h
        List<NavSnapshotDto> h1d = basketService.getNavHistory(TEST_BASKET_1, "1D");

        // System should gracefully return latest available snapshot rather than empty or fabricated synthetic data
        assertFalse(h1d.isEmpty());
        assertEquals(0, new BigDecimal("112.50").compareTo(h1d.get(0).getNav()));
    }

    @Test
    @DisplayName("Verify Unsupported interval throws IllegalArgumentException rather than silently defaulting")
    void testUnsupportedIntervalThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            basketService.getNavHistory(TEST_BASKET_1, "3M");
        }, "Interval 3M must throw IllegalArgumentException");

        assertThrows(IllegalArgumentException.class, () -> {
            basketService.getNavHistory(TEST_BASKET_1, "ALL");
        }, "Interval ALL must throw IllegalArgumentException");
    }

    @Test
    @DisplayName("Verify 24h Change is calculated against 24h historical snapshot rather than last minute")
    void test24hChangeCalculatedAgainst24hHistoricalSnapshot() {
        Instant twentyFiveHoursAgo = Instant.now().minus(25, ChronoUnit.HOURS);
        navSnapshotRepository.save(new NavSnapshotEntity(TEST_BASKET_1, new BigDecimal("100.0000"), twentyFiveHoursAgo));

        // First update: NAV moves to 105.00 (+5.00%)
        basketService.updateNav(TEST_BASKET_1, new BigDecimal("105.0000"));

        // Subsequent update 1 minute later: NAV moves to 106.00
        // Change24h must be (+6.00% against 100.00 from 25h ago), NOT minute-over-minute (+0.95% against 105.00)
        var updatedDto = basketService.updateNav(TEST_BASKET_1, new BigDecimal("106.0000"));

        assertEquals(0, new BigDecimal("6.00").compareTo(updatedDto.getChange_24h()),
                "24h change must be measured against the 24h historical snapshot (+6.00%), not the 1-minute previous NAV");
    }
}
