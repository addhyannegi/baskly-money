package money.baskly.repository;

import money.baskly.entity.SystemSettingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSettingEntity, String> {
    Optional<SystemSettingEntity> findBySettingKey(String settingKey);
}
