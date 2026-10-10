package canteengo_backend.service;

import canteengo_backend.model.CatalogBootstrap;
import canteengo_backend.model.FoodItem;
import canteengo_backend.repository.CatalogBootstrapRepository;
import canteengo_backend.repository.FoodItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class MenuCatalogInitializer implements CommandLineRunner {

    private static final String SEED_VERSION = "canteen-menu-v1";

    private final FoodItemRepository foodItemRepository;
    private final CatalogBootstrapRepository catalogBootstrapRepository;
    private final JdbcTemplate jdbcTemplate;

    public MenuCatalogInitializer(
            FoodItemRepository foodItemRepository,
            CatalogBootstrapRepository catalogBootstrapRepository,
            JdbcTemplate jdbcTemplate) {
        this.foodItemRepository = foodItemRepository;
        this.catalogBootstrapRepository = catalogBootstrapRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) {
        String imageColumnType = jdbcTemplate.queryForObject(
            "select data_type from information_schema.columns " +
                "where table_schema = current_schema() and table_name = 'food_items' and column_name = 'image_url'",
            String.class);
        if (!"text".equalsIgnoreCase(imageColumnType)) {
            jdbcTemplate.execute("ALTER TABLE food_items ALTER COLUMN image_url TYPE TEXT");
        }
        if (catalogBootstrapRepository.existsById(SEED_VERSION)) return;

        List<FoodItem> existingItems = foodItemRepository.findAll();
        for (FoodItem menuItem : defaultMenu()) {
            FoodItem existing = existingItems.stream()
                    .filter(item -> catalogKey(item.getName()).equals(catalogKey(menuItem.getName())))
                    .findFirst()
                    .orElse(null);

            if (existing == null) {
                foodItemRepository.save(menuItem);
                continue;
            }

            existing.setName(menuItem.getName());
            existing.setCategory(menuItem.getCategory());
            existing.setPrice(menuItem.getPrice());
            foodItemRepository.save(existing);
        }

        catalogBootstrapRepository.save(new CatalogBootstrap(SEED_VERSION));
    }

    private static String catalogKey(String name) {
        String key = name == null ? "" : name.trim().toLowerCase(Locale.ROOT);
        key = key.replaceFirst("\\s*\\([^)]*\\)$", "").trim();
        if (key.equals("cutting chai")) return "chai";
        if (key.equals("hot coffee")) return "coffee";
        return key;
    }

    private static List<FoodItem> defaultMenu() {
        List<FoodItem> items = new ArrayList<>();

        add(items, "Breakfast", new String[][]{
                {"Poha", "25"}, {"Upma", "25"}, {"Idli Sambhar (2 pcs)", "30"},
                {"Medu Vada (2 pcs)", "30"}, {"Misal Pav", "40"}, {"Bread Butter", "25"},
                {"Bread Omelette", "40"}, {"Cheese Omelette", "50"},
                {"Aloo Paratha with Curd", "50"}, {"Chole Kulche", "50"}
        });

        add(items, "Snacks", new String[][]{
                {"Samosa (1 pc)", "15"}, {"Kachori (1 pc)", "15"}, {"Vada Pav", "20"},
                {"Dabeli", "25"}, {"Samosa Pav", "25"}, {"Bread Pakoda", "25"},
                {"Batata Bhajiya", "30"}, {"French Fries", "40"}, {"Peri Peri Fries", "50"},
                {"Masala Papad", "25"}, {"Sweet Corn Cup", "35"}, {"Bhel Puri", "30"},
                {"Sev Puri", "35"}, {"Pani Puri", "30"}
        });

        add(items, "Beverages", new String[][]{
                {"Cutting Chai", "10"}, {"Regular Tea", "15"}, {"Hot Coffee", "20"},
                {"Nimbu Pani", "20"}, {"Masala Chaas", "20"}, {"Lemon Soda", "30"},
                {"Packaged Soft Drink (small)", "20"}, {"Packaged Soft Drink (large)", "40"},
                {"Buttermilk", "20"}, {"Cold Coffee", "50"}, {"Chocolate Milkshake", "60"},
                {"Oreo Shake", "70"}, {"Packaged Water (small)", "10"},
                {"Packaged Water (large)", "20"}
        });

        add(items, "Fast Food", new String[][]{
                {"Plain Maggi", "30"}, {"Masala Maggi", "35"}, {"Schezwan Maggi", "40"},
                {"Cheese Maggi", "45"}, {"Veg Sandwich", "35"}, {"Grilled Sandwich", "45"},
                {"Cheese Sandwich", "50"}, {"Veg Frankie", "40"}, {"Cheese Frankie", "50"},
                {"Paneer Frankie", "65"}, {"Aloo Tikki Burger", "40"}, {"Veg Burger", "50"},
                {"Cheese Burger", "65"}, {"Paneer Burger", "80"}, {"Mini Veg Pizza", "60"},
                {"Cheese Pizza", "90"}, {"Garlic Bread", "50"}, {"Steamed Momos", "50"},
                {"Fried Momos", "60"}, {"Kurkure Momos", "80"}, {"Veg Hakka Noodles", "60"},
                {"Schezwan Noodles", "70"}, {"Veg Fried Rice", "60"},
                {"Manchurian Fried Rice", "80"}, {"Veg Manchurian", "70"}
        });

        add(items, "Lunch", new String[][]{
                {"Dal Rice", "50"}, {"Curd Rice", "50"}, {"Rajma Rice", "60"},
                {"Chole Rice", "60"}, {"Veg Pulao", "60"}, {"Veg Biryani", "80"},
                {"Pav Bhaji", "60"}, {"Chole Bhature", "70"}, {"Paneer Rice Bowl", "80"},
                {"Mini Veg Thali", "80"}, {"Regular Veg Thali", "100"}, {"Special Thali", "120"}
        });

        return items;
    }

    private static void add(List<FoodItem> items, String category, String[][] entries) {
        for (String[] entry : entries) {
            items.add(new FoodItem(entry[0], category, Double.parseDouble(entry[1]), "", "", true));
        }
    }
}