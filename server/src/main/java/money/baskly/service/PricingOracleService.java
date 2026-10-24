package money.baskly.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service managing live and fallback constituent token prices (in USD)
 * for the NAV calculation engine.
 */
@Service
public class PricingOracleService {

    private static final Logger log = LoggerFactory.getLogger(PricingOracleService.class);

    private final Map<String, BigDecimal> currentPrices = new ConcurrentHashMap<>();

    public PricingOracleService() {
        // Initialize with canonical inception baseline prices
        currentPrices.putAll(NavEngineService.FALLBACK_INCEPTION_PRICES);
        log.info("PricingOracleService initialized with {} baseline token prices", currentPrices.size());
    }

    /**
     * Returns an unmodifiable snapshot of current USD constituent prices.
     */
    public Map<String, BigDecimal> getCurrentPrices() {
        return Collections.unmodifiableMap(currentPrices);
    }

    /**
     * Retrieves the current price for a specific token symbol.
     */
    public BigDecimal getPrice(String symbol) {
        if (symbol == null) return BigDecimal.ZERO;
        return currentPrices.getOrDefault(symbol.toUpperCase(), BigDecimal.ZERO);
    }

    /**
     * Updates the USD price for an individual token constituent.
     */
    public boolean updatePrice(String symbol, BigDecimal priceUsd) {
        if (symbol == null || priceUsd == null || priceUsd.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Rejected invalid price update for symbol {}: {}", symbol, priceUsd);
            return false;
        }

        String sym = symbol.toUpperCase().trim();
        BigDecimal prev = currentPrices.get(sym);

        // Sanity outlier check: reject changes > 10x or < 0.1x if baseline already exists
        if (prev != null && prev.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal max = prev.multiply(new BigDecimal("10"));
            BigDecimal min = prev.multiply(new BigDecimal("0.1"));
            if (priceUsd.compareTo(max) > 0 || priceUsd.compareTo(min) < 0) {
                log.warn("Outlier price rejected for {}: {} USD (previous: {} USD)", sym, priceUsd, prev);
                return false;
            }
        }

        currentPrices.put(sym, priceUsd);
        log.debug("Updated price for {}: {} USD", sym, priceUsd);
        return true;
    }

    /**
     * Atomically batch updates multiple constituent prices.
     */
    public void updatePrices(Map<String, BigDecimal> newPrices) {
        if (newPrices == null || newPrices.isEmpty()) return;
        newPrices.forEach(this::updatePrice);
    }

    /**
     * Resets constituent prices to baseline inception values.
     */
    public void resetToBaseline() {
        currentPrices.clear();
        currentPrices.putAll(NavEngineService.FALLBACK_INCEPTION_PRICES);
        log.info("Reset all constituent prices to baseline inception anchors");
    }
}
