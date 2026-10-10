package canteengo_backend.service;

import canteengo_backend.model.FoodItem;
import canteengo_backend.repository.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FoodItemService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    // 1. GET ALL
    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    // 2. CREATE (POST)
    public FoodItem addFoodItem(FoodItem foodItem) {
        return foodItemRepository.save(foodItem);
    }

    // 3. UPDATE (PUT) — NAYA ADD HUA HAI
    public FoodItem updateFoodItem(Long id, FoodItem updatedItem) {
        Optional<FoodItem> existingItemOpt = foodItemRepository.findById(id);
        if (existingItemOpt.isPresent()) {
            FoodItem existingItem = existingItemOpt.get();
            existingItem.setName(updatedItem.getName());
            existingItem.setCategory(updatedItem.getCategory());
            existingItem.setPrice(updatedItem.getPrice());
            existingItem.setDescription(updatedItem.getDescription());
            existingItem.setImageUrl(updatedItem.getImageUrl());
            existingItem.setAvailable(updatedItem.getAvailable());
            return foodItemRepository.save(existingItem);
        }
        return null;
    }

    // 4. DELETE — NAYA ADD HUA HAI
    public void deleteFoodItem(Long id) {
        foodItemRepository.deleteById(id);
    }
}