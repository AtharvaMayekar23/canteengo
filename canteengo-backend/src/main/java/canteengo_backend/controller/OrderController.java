package canteengo_backend.controller;

import canteengo_backend.model.Order;
import canteengo_backend.repository.OrderRepository;
import canteengo_backend.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Random;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class OrderController {

    private final OrderRepository orderRepository;

    public OrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Get all orders for Admin Manage Orders & Tracking
    @GetMapping
    public List<Order> getAllOrders(@AuthenticationPrincipal UserPrincipal principal) {
        if ("ADMIN".equals(principal.role())) return orderRepository.findAllNewestFirst();
        return orderRepository.findByStudentEmailIgnoreCase(principal.email());
    }

    // Place new order with auto token generation
    @PostMapping
    public Order placeOrder(@RequestBody Order order, @AuthenticationPrincipal UserPrincipal principal) {
        order.setId(null);
        order.setStudentEmail(principal.email());
        order.setStudentName(principal.name());
        order.setStudentContactNumber(principal.contactNumber());
        if (order.getStatus() == null || order.getStatus().trim().isEmpty()) {
            order.setStatus("PENDING");
        }

        if (order.getTokenNumber() == null || order.getTokenNumber().trim().isEmpty()) {
            int randomNum = 100 + new Random().nextInt(900);
            order.setTokenNumber("TK-" + randomNum);
        }

        if (order.getPlacedAt() == null) {
            order.setPlacedAt(LocalDateTime.now());
        }

        return orderRepository.save(order);
    }

    // Update order status (Admin side)
    @PutMapping("/{id}/status")
    public Order updateOrderStatus(@PathVariable Long id, @RequestBody String status) {
        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));
        String normalizedStatus = status.replace("\"", "").trim().toUpperCase(Locale.ROOT);
        if (!List.of("PENDING", "PREPARING", "READY", "COMPLETED").contains(normalizedStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported order status.");
        }
        if ("COMPLETED".equals(normalizedStatus) && existingOrder.getCompletedAt() == null) {
            existingOrder.setCompletedAt(LocalDateTime.now());
        } else if (!"COMPLETED".equals(normalizedStatus)) {
            existingOrder.setCompletedAt(null);
        }
        existingOrder.setStatus(normalizedStatus);
        return orderRepository.save(existingOrder);
    }
}