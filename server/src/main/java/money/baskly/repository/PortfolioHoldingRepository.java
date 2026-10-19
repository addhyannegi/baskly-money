package money.baskly.repository;

import money.baskly.entity.PortfolioHoldingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioHoldingRepository extends JpaRepository<PortfolioHoldingEntity, Long> {
    List<PortfolioHoldingEntity> findByUserId(String userId);
    Optional<PortfolioHoldingEntity> findByUserIdAndBasketId(String userId, String basketId);
}
