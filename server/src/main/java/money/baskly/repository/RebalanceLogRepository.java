package money.baskly.repository;

import money.baskly.entity.RebalanceLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RebalanceLogRepository extends JpaRepository<RebalanceLogEntity, String> {
    List<RebalanceLogEntity> findAllByOrderByCreatedAtDesc();
    List<RebalanceLogEntity> findByBasketIdOrderByCreatedAtDesc(String basketId);
}
