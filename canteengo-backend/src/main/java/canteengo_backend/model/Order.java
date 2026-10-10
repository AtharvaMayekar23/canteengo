package canteengo_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String items;

    private Double total;
    private String status;
    private String tokenNumber;

    private LocalDateTime placedAt;
    private LocalDateTime completedAt;
    private String studentEmail;
    private String studentName;
    private String studentContactNumber;

    public Order() {}

    public Order(String items, Double total, String status, String tokenNumber) {
        this.items = items;
        this.total = total;
        this.status = status;
        this.tokenNumber = tokenNumber;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getItems() { return items; }
    public void setItems(String items) { this.items = items; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public LocalDateTime getPlacedAt() { return placedAt; }
    public void setPlacedAt(LocalDateTime placedAt) { this.placedAt = placedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentContactNumber() { return studentContactNumber; }
    public void setStudentContactNumber(String studentContactNumber) { this.studentContactNumber = studentContactNumber; }
}