package canteengo_backend.repository;

import canteengo_backend.model.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
	Optional<FoodItem> findByNameIgnoreCase(String name);
}