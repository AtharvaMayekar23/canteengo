package canteengo_backend.controller;

import canteengo_backend.model.FoodItem;
import canteengo_backend.service.FoodItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-items")
public class FoodItemController {

    @Autowired
    private FoodItemService foodItemService;

    // GET ALL
    @GetMapping
    public List<FoodItem> getAllItems() {
        return foodItemService.getAllFoodItems();
    }

    // POST
    @PostMapping
    public FoodItem createItem(@RequestBody FoodItem foodItem) {
        return foodItemService.addFoodItem(foodItem);
    }

    // PUT (UPDATE) — NAYA ADD HUA HAI
    @PutMapping("/{id}")
    public ResponseEntity<FoodItem> updateItem(@PathVariable Long id, @RequestBody FoodItem updatedItem) {
        FoodItem item = foodItemService.updateFoodItem(id, updatedItem);
        if (item != null) {
            return ResponseEntity.ok(item);
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE — NAYA ADD HUA HAI
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.noContent().build();
    }
}