package money.baskly.repository;

import money.baskly.entity.BasketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BasketRepository extends JpaRepository<BasketEntity, String> {
    List<BasketEntity> findAllByOrderByIndexNumAsc();
}
