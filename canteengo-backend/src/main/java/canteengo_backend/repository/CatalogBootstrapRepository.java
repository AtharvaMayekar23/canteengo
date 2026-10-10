package canteengo_backend.repository;

import canteengo_backend.model.CatalogBootstrap;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogBootstrapRepository extends JpaRepository<CatalogBootstrap, String> {
}