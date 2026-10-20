package money.baskly.repository;

import money.baskly.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, String> {
    List<TransactionEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    List<TransactionEntity> findAllByOrderByCreatedAtDesc();
}
