package money.baskly.service;

import jakarta.annotation.PostConstruct;
import money.baskly.dto.BasketConstituentDto;
import money.baskly.dto.BasketDto;
import money.baskly.dto.NavSnapshotDto;
import money.baskly.entity.BasketConstituentEntity;
import money.baskly.entity.BasketEntity;
import money.baskly.entity.NavSnapshotEntity;
import money.baskly.repository.BasketConstituentRepository;
import money.baskly.repository.BasketRepository;
import money.baskly.repository.NavSnapshotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BasketService {

    private static final Logger log = LoggerFactory.getLogger(BasketService.class);

    private final BasketRepository basketRepository;
    private final BasketConstituentRepository constituentRepository;
    private final NavSnapshotRepository navSnapshotRepository;

    public BasketService(BasketRepository basketRepository, 
                         BasketConstituentRepository constituentRepository, 
                         NavSnapshotRepository navSnapshotRepository) {
        this.basketRepository = basketRepository;
        this.constituentRepository = constituentRepository;
        this.navSnapshotRepository = navSnapshotRepository;
    }

    /**
     * Ensures every basket in the system has at least one initial baseline snapshot (Base ₹100.00).
     */
    @PostConstruct
    @Transactional
    public void ensureBaselineSnapshotsExist() {
        try {
            List<BasketEntity> baskets = basketRepository.findAll();
            for (BasketEntity basket : baskets) {
                if (navSnapshotRepository.countByBasketId(basket.getId()) == 0) {
                    BigDecimal initialNav = basket.getNav() != null && basket.getNav().compareTo(BigDecimal.ZERO) > 0
                            ? basket.getNav()
                            : new BigDecimal("100.0000");
                    navSnapshotRepository.save(new NavSnapshotEntity(basket.getId(), initialNav, Instant.now()));
                    log.info("Initialized baseline ₹100 NAV snapshot for basket: {}", basket.getId());
                }
            }
        } catch (Exception e) {
            log.warn("Could not check or seed baseline NAV snapshots during startup: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<BasketDto> getAllBaskets() {
        return basketRepository.findAllByOrderByIndexNumAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<BasketDto> getBasketById(String id) {
        return basketRepository.findById(id).map(this::toDto);
    }

    @Transactional
    public BasketDto updateNav(String basketId, BigDecimal newNav) {
        BasketEntity basket = basketRepository.findById(basketId)
                .orElseThrow(() -> new IllegalArgumentException("Basket not found: " + basketId));
        
        BigDecimal oldNav = basket.getNav();
        basket.setNav(newNav);
        if (oldNav.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = newNav.subtract(oldNav);
            BigDecimal change = diff.divide(oldNav, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            basket.setChange24h(change.setScale(2, java.math.RoundingMode.HALF_UP));
        }
        basket.setUpdatedAt(Instant.now());
        basket = basketRepository.save(basket);

        navSnapshotRepository.save(new NavSnapshotEntity(basketId, newNav, Instant.now()));

        return toDto(basket);
    }

    /**
     * Retrieves historical NAV snapshots for a specific basket over a requested interval (1D, 1W, 1M, 1Y, 5Y).
     */
    @Transactional(readOnly = true)
    public List<NavSnapshotDto> getNavHistory(String basketId, String interval) {
        if (!basketRepository.existsById(basketId)) {
            throw new IllegalArgumentException("Basket not found: " + basketId);
        }

        Instant since = calculateSinceTimestamp(interval);
        List<NavSnapshotEntity> snapshots = navSnapshotRepository
                .findByBasketIdAndRecordedAtGreaterThanEqualOrderByRecordedAtAsc(basketId, since);

        if (snapshots.isEmpty()) {
            Optional<NavSnapshotEntity> latest = navSnapshotRepository.findTopByBasketIdOrderByRecordedAtDesc(basketId);
            if (latest.isPresent()) {
                snapshots = List.of(latest.get());
            }
        }

        return snapshots.stream()
                .map(s -> new NavSnapshotDto(s.getId(), s.getBasketId(), s.getNav(), s.getRecordedAt()))
                .collect(Collectors.toList());
    }

    /**
     * Translates standard interval codes into historical cutoff timestamps.
     */
    public Instant calculateSinceTimestamp(String interval) {
        Instant now = Instant.now();
        if (interval == null) return now.minus(1, ChronoUnit.DAYS);

        return switch (interval.toUpperCase().trim()) {
            case "1W", "7D" -> now.minus(7, ChronoUnit.DAYS);
            case "1M", "30D" -> now.minus(30, ChronoUnit.DAYS);
            case "1Y", "365D" -> now.minus(365, ChronoUnit.DAYS);
            case "5Y" -> now.minus(365 * 5L, ChronoUnit.DAYS);
            case "1D", "24H" -> now.minus(1, ChronoUnit.DAYS);
            default -> now.minus(1, ChronoUnit.DAYS);
        };
    }

    public BasketDto toDto(BasketEntity entity) {
        BasketDto dto = new BasketDto();
        dto.setId(entity.getId());
        dto.setIndexNum(entity.getIndexNum());
        dto.setName(entity.getName());
        dto.setSerifWord(entity.getSerifWord());
        dto.setTagline(entity.getTagline());
        dto.setDescription(entity.getDescription());
        dto.setRisk(entity.getRisk());
        dto.setRiskColor(entity.getRiskColor());
        dto.setFee_pct(entity.getFeePct());
        dto.setMin_sip(entity.getMinSip());
        dto.setExpected_cagr(entity.getExpectedCagr());
        dto.setNav(entity.getNav());
        dto.setChange_24h(entity.getChange24h());

        List<BasketConstituentDto> constituents = new ArrayList<>();
        if (entity.getConstituents() != null && !entity.getConstituents().isEmpty()) {
            constituents = entity.getConstituents().stream()
                    .map(c -> new BasketConstituentDto(c.getSymbol(), c.getName(), c.getWeight(), c.getColor(), c.getPriceInr()))
                    .collect(Collectors.toList());
        } else {
            constituents = constituentRepository.findByBasketId(entity.getId()).stream()
                    .map(c -> new BasketConstituentDto(c.getSymbol(), c.getName(), c.getWeight(), c.getColor(), c.getPriceInr()))
                    .collect(Collectors.toList());
        }
        dto.setAssets(constituents);
        return dto;
    }
}
