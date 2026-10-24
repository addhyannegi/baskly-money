package money.baskly.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service managing live and fallback constituent token prices (in USD)
 * for the NAV calculation engine. Fetches live market data from institutional
 * oracles (CoinGecko / CoinDCX / Binance) with resilient caching and outlier checks.
 */
@Service
public class PricingOracleService {

    private static final Logger log = LoggerFactory.getLogger(PricingOracleService.class);

    private final Map<String, BigDecimal> currentPrices = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;

    @Value("${app.nav.oracle.fetch-live:true}")
    private boolean fetchLivePrices = true;

    private static final Map<String, String> COINGECKO_ID_TO_SYMBOL;

    static {
        Map<String, String> map = new HashMap<>();
        map.put("bitcoin", "BTC");
        map.put("ethereum", "ETH");
        map.put("solana", "SOL");
        map.put("binancecoin", "BNB");
        map.put("ripple", "XRP");
        map.put("pax-gold", "PAXG");
        map.put("uniswap", "UNI");
        map.put("aave", "AAVE");
        map.put("chainlink", "LINK");
        map.put("pendle", "PENDLE");
        map.put("lido-dao", "LDO");
        map.put("dogecoin", "DOGE");
        map.put("shiba-inu", "SHIB");
        map.put("pepe", "PEPE");
        map.put("bonk", "BONK");
        map.put("dogwifcoin", "WIF");
        COINGECKO_ID_TO_SYMBOL = Collections.unmodifiableMap(map);
    }

    public PricingOracleService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();

        // Initialize with canonical inception baseline prices
        currentPrices.putAll(NavEngineService.FALLBACK_INCEPTION_PRICES);
        log.info("PricingOracleService initialized with {} baseline token prices", currentPrices.size());
    }

    /**
     * Polls public pricing oracles to refresh constituent market prices.
     * Returns the count of prices successfully updated.
     */
    public int refreshMarketPrices() {
        if (!fetchLivePrices) {
            return 0;
        }

        int updated = 0;
        try {
            updated += fetchCoinGeckoPrices();
        } catch (Exception e) {
            log.debug("[PricingOracle] CoinGecko live refresh non-fatal error: {}", e.getMessage());
        }

        if (updated < 10) {
            try {
                updated += fetchCoinDcxPrices();
            } catch (Exception e) {
                log.debug("[PricingOracle] CoinDCX live refresh non-fatal error: {}", e.getMessage());
            }
        }

        if (updated > 0) {
            log.info("[PricingOracle] Successfully refreshed {} live market prices", updated);
        }
        return updated;
    }

    private int fetchCoinGeckoPrices() throws Exception {
        String ids = String.join(",", COINGECKO_ID_TO_SYMBOL.keySet());
        String url = "https://api.coingecko.com/api/v3/simple/price?ids=" + ids + "&vs_currencies=usd";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/json")
                .header("User-Agent", "BasklyPricingEngine/1.0")
                .timeout(Duration.ofSeconds(4))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            return 0;
        }

        JsonNode root = objectMapper.readTree(response.body());
        int updated = 0;

        for (Map.Entry<String, String> entry : COINGECKO_ID_TO_SYMBOL.entrySet()) {
            String cgId = entry.getKey();
            String sym = entry.getValue();
            JsonNode priceNode = root.path(cgId).path("usd");
            if (!priceNode.isMissingNode() && priceNode.isNumber()) {
                BigDecimal price = new BigDecimal(priceNode.asText());
                if (updatePrice(sym, price)) {
                    updated++;
                }
            }
        }
        return updated;
    }

    private int fetchCoinDcxPrices() throws Exception {
        String url = "https://public.coindcx.com/exchange/ticker";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/json")
                .header("User-Agent", "BasklyPricingEngine/1.0")
                .timeout(Duration.ofSeconds(4))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            return 0;
        }

        JsonNode root = objectMapper.readTree(response.body());
        int updated = 0;

        if (root.isArray()) {
            for (JsonNode item : root) {
                String market = item.path("market").asText();
                if (market != null && market.endsWith("USDT")) {
                    String sym = market.substring(0, market.length() - 4).toUpperCase();
                    if (NavEngineService.FALLBACK_INCEPTION_PRICES.containsKey(sym)) {
                        String priceStr = item.path("last_price").asText();
                        if (priceStr != null && !priceStr.isBlank()) {
                            try {
                                BigDecimal price = new BigDecimal(priceStr);
                                if (updatePrice(sym, price)) {
                                    updated++;
                                }
                            } catch (Exception ignored) {}
                        }
                    }
                }
            }
        }
        return updated;
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

    public void setFetchLivePrices(boolean fetchLivePrices) {
        this.fetchLivePrices = fetchLivePrices;
    }
}
