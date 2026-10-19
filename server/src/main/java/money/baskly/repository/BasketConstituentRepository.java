package money.baskly.repository;

import money.baskly.entity.BasketConstituentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BasketConstituentRepository extends JpaRepository<BasketConstituentEntity, Long> {
    List<BasketConstituentEntity> findByBasketId(String basketId);
}
