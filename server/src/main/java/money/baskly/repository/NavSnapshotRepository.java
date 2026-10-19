package money.baskly.repository;

import money.baskly.entity.NavSnapshotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NavSnapshotRepository extends JpaRepository<NavSnapshotEntity, Long> {
    List<NavSnapshotEntity> findByBasketIdOrderByRecordedAtAsc(String basketId);
}
