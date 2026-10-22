package money.baskly.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class NavEngineServiceTest {

    private NavEngineService navEngine;

    @BeforeEach
    void setUp() {
        navEngine = new NavEngineService();
    }

    @Test
    @DisplayName("Verify Inception Token Prices yield exactly ₹100.00 NAV across all baskets")
    void testInceptionNavIs100() {
        Map<String, BigDecimal> fallbackPrices = new HashMap<>();
        fallbackPrices.put("BTC", new BigDecimal("81604"));
        fallbackPrices.put("ETH", new BigDecimal("2411"));
        fallbackPrices.put("SOL", new BigDecimal("112"));
        fallbackPrices.put("BNB", new BigDecimal("685"));
        fallbackPrices.put("XRP", new BigDecimal("1.25"));
        fallbackPrices.put("PAXG", new BigDecimal("4164"));
        fallbackPrices.put("UNI", new BigDecimal("7.15"));
        fallbackPrices.put("AAVE", new BigDecimal("154"));
        fallbackPrices.put("LINK", new BigDecimal("12.4"));
        fallbackPrices.put("PENDLE", new BigDecimal("2.09"));
        fallbackPrices.put("LDO", new BigDecimal("0.94"));
        fallbackPrices.put("DOGE", new BigDecimal("0.162"));
        fallbackPrices.put("SHIB", new BigDecimal("0.0000185"));
        fallbackPrices.put("PEPE", new BigDecimal("0.0000086"));
        fallbackPrices.put("BONK", new BigDecimal("0.0000192"));
        fallbackPrices.put("WIF", new BigDecimal("1.84"));

        for (String basketId : NavEngineService.CANONICAL_BASE_USD_SUMS.keySet()) {
            BigDecimal nav = navEngine.calculateBasketNav(basketId, fallbackPrices);
            assertEquals(new BigDecimal("100.00"), nav, "Basket " + basketId + " must anchor to 100.00 at inception");
        }
    }

    @Test
    @DisplayName("Verify Top-5 NAV of ₹99.47 produces exact Portfolio Valuation of ₹4,48,789")
    void testTop5PortfolioValuationParity() {
        BigDecimal top5Nav = new BigDecimal("99.47");
        BigDecimal valuation = navEngine.calculateActiveFolioValuation(top5Nav);

        // 4511.8 units * 99.47 = 448,788.746 -> rounded to 448,789
        assertEquals(new BigDecimal("448789"), valuation);
    }

    @Test
    @DisplayName("Verify Altcoin Meme reproduces ~₹17.67 upon WIF market repricing")
    void testAltcoinMemeRepricing() {
        Map<String, BigDecimal> livePrices = new HashMap<>();
        livePrices.put("DOGE", new BigDecimal("0.162"));
        livePrices.put("SHIB", new BigDecimal("0.0000185"));
        livePrices.put("PEPE", new BigDecimal("0.0000086"));
        livePrices.put("BONK", new BigDecimal("0.0000192"));
        livePrices.put("WIF", new BigDecimal("0.1918")); // Live Binance spot drop from 1.84

        BigDecimal nav = navEngine.calculateBasketNav("altcoin-meme", livePrices);
        assertEquals(new BigDecimal("17.67"), nav, "Altcoin meme NAV must accurately reflect WIF drop to 13.46");
    }
}
