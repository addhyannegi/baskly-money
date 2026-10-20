package money.baskly.repository;

import money.baskly.entity.UpiMandateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UpiMandateRepository extends JpaRepository<UpiMandateEntity, String> {
    List<UpiMandateEntity> findByUserId(String userId);
    List<UpiMandateEntity> findByUserIdAndStatus(String userId, String status);
}
