package canteengo_backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "catalog_bootstrap")
public class CatalogBootstrap {

    @Id
    private String id;

    public CatalogBootstrap() {}

    public CatalogBootstrap(String id) {
        this.id = id;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
}