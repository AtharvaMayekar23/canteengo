package canteengo_backend.repository;

import canteengo_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
	List<Order> findByStudentEmailIgnoreCase(String studentEmail);

	@Query("SELECT o FROM Order o ORDER BY CASE WHEN UPPER(o.status) = 'COMPLETED' THEN 1 ELSE 0 END, "
			+ "CASE WHEN o.placedAt IS NULL THEN 1 ELSE 0 END, o.placedAt DESC, o.id DESC")
	List<Order> findAllNewestFirst();
}