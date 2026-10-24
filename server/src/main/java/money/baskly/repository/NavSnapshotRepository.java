package money.baskly.repository;

import money.baskly.entity.NavSnapshotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface NavSnapshotRepository extends JpaRepository<NavSnapshotEntity, Long> {
    List<NavSnapshotEntity> findByBasketIdOrderByRecordedAtAsc(String basketId);

    List<NavSnapshotEntity> findByBasketIdAndRecordedAtGreaterThanEqualOrderByRecordedAtAsc(String basketId, Instant since);

    Optional<NavSnapshotEntity> findTopByBasketIdOrderByRecordedAtDesc(String basketId);

    Optional<NavSnapshotEntity> findTopByBasketIdAndRecordedAtLessThanEqualOrderByRecordedAtDesc(String basketId, Instant cutoff);

    long countByBasketId(String basketId);
}
