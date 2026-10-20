package money.baskly.service;

import money.baskly.dto.BasketConstituentDto;
import money.baskly.dto.BasketDto;
import money.baskly.entity.BasketConstituentEntity;
import money.baskly.entity.BasketEntity;
import money.baskly.entity.NavSnapshotEntity;
import money.baskly.repository.BasketConstituentRepository;
import money.baskly.repository.BasketRepository;
import money.baskly.repository.NavSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BasketService {

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
