package money.baskly.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Authoritative Live Pricing & NAV Calculation Engine ported from app.js (lines 1867-1886)
 * and oracle/pricing_oracle.js.
 * 
 * Provides unified, deterministic NAV and portfolio valuation math across the platform.
 */
@Service
public class NavEngineService {

    // Canonical Inception Base USD Sums matching app.js fallback token pricing
    public static final Map<String, BigDecimal> CANONICAL_BASE_USD_SUMS;

    // Fixed Constituent Target Weights (rebalanced monthly)
    public static final Map<String, Map<String, BigDecimal>> BASKET_TARGET_WEIGHTS;

    // Active Mandate #IND-8841 Base Folio Units (Hero Top-5 Card)
    public static final BigDecimal ACTIVE_FOLIO_UNITS = new BigDecimal("4511.8");

    static {
        Map<String, BigDecimal> baseMap = new HashMap<>();
        baseMap.put("top-5-index", new BigDecimal("45430.4875"));
        baseMap.put("crypto-gold", new BigDecimal("31005.05"));
        baseMap.put("bitcoin", new BigDecimal("81604.0"));
        baseMap.put("ethereum", new BigDecimal("2411.0"));
        baseMap.put("defi", new BigDecimal("43.795"));
        baseMap.put("altcoin-meme", new BigDecimal("0.40040926"));
        CANONICAL_BASE_USD_SUMS = Collections.unmodifiableMap(baseMap);

        Map<String, Map<String, BigDecimal>> weightsMap = new HashMap<>();

        // Top-5 Bluechip Index
        Map<String, BigDecimal> top5 = new HashMap<>();
        top5.put("BTC", new BigDecimal("0.55"));
        top5.put("ETH", new BigDecimal("0.20"));
        top5.put("SOL", new BigDecimal("0.10"));
        top5.put("BNB", new BigDecimal("0.08"));
        top5.put("XRP", new BigDecimal("0.07"));
        weightsMap.put("top-5-index", Collections.unmodifiableMap(top5));

        // Crypto + Gold Reserve
        Map<String, BigDecimal> gold = new HashMap<>();
        gold.put("PAXG", new BigDecimal("0.50"));
        gold.put("BTC", new BigDecimal("0.35"));
        gold.put("ETH", new BigDecimal("0.15"));
        weightsMap.put("crypto-gold", Collections.unmodifiableMap(gold));

        // Pure Bitcoin Sovereign
        weightsMap.put("bitcoin", Collections.singletonMap("BTC", BigDecimal.ONE));

        // Ethereum Settlement Layer
        weightsMap.put("ethereum", Collections.singletonMap("ETH", BigDecimal.ONE));

        // DeFi Protocol Architects
        Map<String, BigDecimal> defi = new HashMap<>();
        defi.put("UNI", new BigDecimal("0.25"));
        defi.put("AAVE", new BigDecimal("0.25"));
        defi.put("LINK", new BigDecimal("0.25"));
        defi.put("PENDLE", new BigDecimal("0.15"));
        defi.put("LDO", new BigDecimal("0.10"));
        weightsMap.put("defi", Collections.unmodifiableMap(defi));

        // High-Beta Cultural Index
        Map<String, BigDecimal> meme = new HashMap<>();
        meme.put("DOGE", new BigDecimal("0.20"));
        meme.put("SHIB", new BigDecimal("0.20"));
        meme.put("PEPE", new BigDecimal("0.20"));
        meme.put("BONK", new BigDecimal("0.20"));
        meme.put("WIF", new BigDecimal("0.20"));
        weightsMap.put("altcoin-meme", Collections.unmodifiableMap(meme));

        BASKET_TARGET_WEIGHTS = Collections.unmodifiableMap(weightsMap);
    }

    /**
     * Calculates dynamic Basket NAV from live USD token prices using the original app.js formula:
     * NAV = (BasketSumUSD / BaseSumUSD) * 100.00
     */
    public BigDecimal calculateBasketNav(String basketId, Map<String, BigDecimal> tokenUsdPrices) {
        Map<String, BigDecimal> weights = BASKET_TARGET_WEIGHTS.get(basketId);
        if (weights == null) {
            throw new IllegalArgumentException("Unknown basket ID: " + basketId);
        }

        BigDecimal baseSumUsd = CANONICAL_BASE_USD_SUMS.get(basketId);
        if (baseSumUsd == null || baseSumUsd.compareTo(BigDecimal.ZERO) <= 0) {
            return new BigDecimal("100.00");
        }

        BigDecimal basketSumUsd = BigDecimal.ZERO;
        for (Map.Entry<String, BigDecimal> entry : weights.entrySet()) {
            String symbol = entry.getKey();
            BigDecimal weight = entry.getValue();
            BigDecimal priceUsd = tokenUsdPrices.getOrDefault(symbol, BigDecimal.ZERO);
            basketSumUsd = basketSumUsd.add(priceUsd.multiply(weight));
        }

        return basketSumUsd
                .divide(baseSumUsd, 8, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Computes the 24h percentage return against base 100.00 anchor:
     * Change% = ((NAV - 100.00) / 100.00) * 100%
     */
    public BigDecimal calculate24hChange(BigDecimal nav) {
        if (nav == null) return BigDecimal.ZERO;
        return nav.subtract(new BigDecimal("100.00")).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates live valuation for any holding: Units * NAV
     */
    public BigDecimal calculateHoldingValuation(BigDecimal units, BigDecimal nav) {
        if (units == null || nav == null) return BigDecimal.ZERO;
        return units.multiply(nav).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates the Active Folio #IND-8841 Hero card valuation: 4511.8 units * Top-5 NAV
     */
    public BigDecimal calculateActiveFolioValuation(BigDecimal top5Nav) {
        if (top5Nav == null) return BigDecimal.ZERO;
        return ACTIVE_FOLIO_UNITS.multiply(top5Nav).setScale(0, RoundingMode.HALF_UP);
    }
}
