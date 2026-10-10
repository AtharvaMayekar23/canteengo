package canteengo_backend;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;
import canteengo_backend.controller.OrderController;
import canteengo_backend.model.Order;
import canteengo_backend.model.Admin;
import canteengo_backend.repository.StudentRepository;
import canteengo_backend.repository.OrderRepository;
import canteengo_backend.repository.AdminRepository;
import canteengo_backend.service.AuthenticationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CanteengoBackendApplicationTests {
	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private OrderController orderController;

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private AuthenticationService authenticationService;

	@Autowired
	private StudentRepository studentRepository;

	@Autowired
	private AdminRepository adminRepository;

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	@Transactional
	void newOrdersAreReturnedNewestFirst() {
		LocalDateTime now = LocalDateTime.now();
		Order olderOrder = new Order("Older order", 10.0, "PENDING", "TK-OLD");
		olderOrder.setPlacedAt(now.minusMinutes(2));
		Order newerOrder = new Order("Newer order", 20.0, "PENDING", "TK-NEW");
		newerOrder.setPlacedAt(now.minusMinutes(1));
		Order newestOrder = new Order("Newest order", 30.0, "PENDING", "TK-LATEST");
		newestOrder.setPlacedAt(now);
		orderRepository.saveAll(List.of(olderOrder, newerOrder, newestOrder));

		List<Long> orderedIds = orderRepository.findAllNewestFirst().stream()
				.map(Order::getId)
				.toList();
		Assertions.assertTrue(orderedIds.indexOf(newestOrder.getId()) < orderedIds.indexOf(newerOrder.getId()));
		Assertions.assertTrue(orderedIds.indexOf(newerOrder.getId()) < orderedIds.indexOf(olderOrder.getId()));
	}

	@Test
	void standardMenuIsSeededOnceWithAllCategories() {
		List<String> categories = jdbcTemplate.queryForList(
				"select distinct category from food_items", String.class);
		Assertions.assertTrue(categories.containsAll(
				List.of("Breakfast", "Snacks", "Beverages", "Fast Food", "Lunch")));
		Assertions.assertTrue(jdbcTemplate.queryForObject(
				"select count(*) from food_items where name = 'Special Thali'", Long.class) > 0);
	}

	@Test
	void foodImagesCanUseUploadedImageData() {
		String imageColumnType = jdbcTemplate.queryForObject(
				"select data_type from information_schema.columns " +
				"where table_schema = current_schema() and table_name = 'food_items' and column_name = 'image_url'",
				String.class);
		Assertions.assertEquals("text", imageColumnType);
	}

	@Test
	void studentAndAdminCredentialsUseSeparateDatabaseTables() {
		Long authTableCount = jdbcTemplate.queryForObject(
				"select count(*) from information_schema.tables " +
				"where table_schema = current_schema() and table_name in ('students', 'admins')",
				Long.class);
		Assertions.assertEquals(2L, authTableCount);
		Assertions.assertTrue(jdbcTemplate.queryForList(
				"select column_name from information_schema.columns " +
				"where table_schema = current_schema() and table_name = 'students'",
				String.class).containsAll(List.of("name", "email", "contact_number", "password_hash")));
	}

	@Test
	@Transactional
	void completingOrderRecordsTimestampWithoutReplacingIt() {
		Order order = new Order("Test item", 10.0, "PENDING", "TK-TEST");
		order = orderRepository.save(order);

		Order completedOrder = orderController.updateOrderStatus(order.getId(), "\"COMPLETED\"");
		LocalDateTime completedAt = completedOrder.getCompletedAt();
		Assertions.assertNotNull(completedAt);

		Order unchangedCompletion = orderController.updateOrderStatus(order.getId(), "\"COMPLETED\"");
		Assertions.assertEquals(completedAt, unchangedCompletion.getCompletedAt());
	}

	@Test
	@Transactional
	void studentRegistrationCannotCreateOrAuthenticateAsAdmin() {
		String email = "student-auth-test@canteengo.local";
		AuthenticationService.AuthResult registration = authenticationService.registerStudent(
				"Auth Test Student", email, "+15551234567", "student-password-123");
		Assertions.assertEquals("STUDENT", registration.role());
		Assertions.assertEquals("+15551234567", registration.contactNumber());
		Assertions.assertTrue(studentRepository.findByEmailIgnoreCase(email)
				.orElseThrow().getPasswordHash().startsWith("$2a$"));
		Assertions.assertEquals("STUDENT", authenticationService.login(
				email, "student-password-123", "STUDENT", null).role());
		Assertions.assertThrows(org.springframework.web.server.ResponseStatusException.class,
				() -> authenticationService.login(email, "student-password-123", "ADMIN", null));
	}

	@Test
	@Transactional
	void legacyPlainAdminPasswordIsUpgradedAfterSuccessfulLogin() {
		String email = "legacy-admin-" + UUID.randomUUID() + "@canteengo.local";
		Long id = jdbcTemplate.queryForObject("select coalesce(max(id), 0) + 1000 from admins", Long.class);
		jdbcTemplate.update(
				"insert into admins (id, name, email, password_hash) values (?, ?, ?, ?)",
				id, "Legacy Admin", email, "legacy-admin-password");

		AuthenticationService.AuthResult result = authenticationService.login(
				email, "legacy-admin-password", "ADMIN", null);
		Assertions.assertEquals("ADMIN", result.role());
		adminRepository.flush();
		Assertions.assertTrue(jdbcTemplate.queryForObject(
				"select password_hash from admins where email = ?", String.class, email).startsWith("$2"));
	}

	@Test
	@Transactional
	void studentTokenCannotMutateAdminFood() throws Exception {
		AuthenticationService.AuthResult student = authenticationService.registerStudent(
				"Route Test Student", "route-auth-test@canteengo.local", "+15551234568", "student-password-123");

		mockMvc.perform(post("/api/food-items")
					.header("Authorization", "Bearer " + student.token())
					.contentType("application/json")
					.content("{}"))
				.andExpect(status().isForbidden());

		mockMvc.perform(post("/api/orders")
					.header("Authorization", "Bearer " + student.token())
					.contentType("application/json")
					.content("{\"items\":\"Poha (1)\",\"total\":25}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.studentName").value("Route Test Student"))
				.andExpect(jsonPath("$.studentContactNumber").value("+15551234568"));

		mockMvc.perform(get("/api/orders")
					.header("Authorization", "Bearer " + student.token()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].studentEmail").value("route-auth-test@canteengo.local"));
	}

	@Test
	void frontendLoginCorsPreflightIsAllowed() throws Exception {
		mockMvc.perform(options("/api/auth/login")
					.header(HttpHeaders.ORIGIN, "http://localhost:5173")
					.header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
					.header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type,authorization"))
				.andExpect(status().isOk())
				.andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
	}

	@Test
	void invalidBrowserLoginIsUnauthorizedNotForbidden() throws Exception {
		mockMvc.perform(post("/api/auth/login")
					.header(HttpHeaders.ORIGIN, "http://localhost:5173")
					.contentType("application/json")
					.content("{\"email\":\"invalid-login@canteengo.local\",\"password\":\"invalid-password\",\"role\":\"STUDENT\",\"contactNumber\":\"+15551234567\"}"))
				.andExpect(status().isUnauthorized())
				.andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*"));
	}

}
