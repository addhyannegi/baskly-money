package money.baskly.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import money.baskly.auth.model.Role;
import money.baskly.dto.BuyOrderRequest;
import money.baskly.dto.WithdrawOrderRequest;
import money.baskly.entity.BasketEntity;
import money.baskly.entity.UserEntity;
import money.baskly.repository.BasketRepository;
import money.baskly.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FundAndRbacCompatibilityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BasketRepository basketRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String TEST_FUND_ID = "top-5-index";
    private static final String TEST_USER_ID = "demo-user";

    @BeforeEach
    void setUp() {
        if (!basketRepository.existsById(TEST_FUND_ID)) {
            BasketEntity basket = new BasketEntity();
            basket.setId(TEST_FUND_ID);
            basket.setIndexNum("01");
            basket.setName("Top-5 Bluechip Index");
            basket.setSerifWord("Bluechip");
            basket.setTagline("Top digital assets");
            basket.setDescription("Institutional crypto index");
            basket.setRisk("Balanced Core");
            basket.setRiskColor("#0F6E56");
            basket.setFeePct(new BigDecimal("1.25"));
            basket.setMinSip(new BigDecimal("1000.00"));
            basket.setExpectedCagr(new BigDecimal("28.5"));
            basket.setNav(new BigDecimal("100.0000"));
            basket.setChange24h(BigDecimal.ZERO);
            basket.setRebalanceDriftThreshold(new BigDecimal("5.00"));
            basketRepository.save(basket);
        }

        if (!userRepository.existsById(TEST_USER_ID)) {
            UserEntity user = new UserEntity(
                    TEST_USER_ID,
                    "Vikram Malhotra",
                    "vikram.m@example.com",
                    null,
                    "Vikram",
                    "CUSTOMER",
                    "VERIFIED",
                    "ABCDE1234F",
                    new BigDecimal("50000.00")
            );
            userRepository.save(user);
        }
    }

    @Test
    @DisplayName("Role alias mapping supports RETAIL_USER as CUSTOMER correctly")
    void testRoleAliasMapping() {
        assertEquals(Role.CUSTOMER, Role.fromString("RETAIL_USER"));
        assertEquals(Role.CUSTOMER, Role.fromString("retail_user"));
        assertEquals(Role.CUSTOMER, Role.fromString("CUSTOMER"));
        assertEquals(Role.FUND_MANAGER, Role.fromString("FUND_MANAGER"));
        assertEquals(Role.ADMIN, Role.fromString("ADMIN"));
        assertEquals(Role.RETAIL_USER, Role.valueOf("RETAIL_USER"));
        assertEquals(Role.CUSTOMER, Role.RETAIL_USER.toCanonicalRole());
    }

    @Test
    @DisplayName("GET /api/v1/funds returns fund/basket catalogue publicly")
    void testGetFundsCataloguePublicly() throws Exception {
        mockMvc.perform(get("/api/v1/funds"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/funds/{id}/nav?interval=1w returns NAV history publicly")
    void testGetFundNavHistory() throws Exception {
        mockMvc.perform(get("/api/v1/funds/" + TEST_FUND_ID + "/nav?interval=1w"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/funds/{id}/nav is rejected for unauthenticated users")
    void testUnauthenticatedNavWriteRejected() throws Exception {
        mockMvc.perform(post("/api/v1/funds/" + TEST_FUND_ID + "/nav")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Collections.singletonMap("nav", new BigDecimal("120.50")))))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "customer@baskly.money", roles = {"CUSTOMER"})
    @DisplayName("POST /api/v1/funds/{id}/nav is forbidden for retail users (CUSTOMER)")
    void testRetailUserNavWriteForbidden() throws Exception {
        mockMvc.perform(post("/api/v1/funds/" + TEST_FUND_ID + "/nav")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Collections.singletonMap("nav", new BigDecimal("120.50")))))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "manager@baskly.money", roles = {"FUND_MANAGER"})
    @DisplayName("POST /api/v1/funds/{id}/nav succeeds for FUND_MANAGER")
    void testFundManagerNavWriteAuthorized() throws Exception {
        mockMvc.perform(post("/api/v1/funds/" + TEST_FUND_ID + "/nav")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Collections.singletonMap("nav", new BigDecimal("105.00")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Unauthenticated request to /api/v1/manager/summary is rejected")
    void testUnauthenticatedManagerEndpointRejected() throws Exception {
        mockMvc.perform(get("/api/v1/manager/summary"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request to /api/v1/manager/circuit-breaker is rejected")
    void testUnauthenticatedCircuitBreakerRejected() throws Exception {
        mockMvc.perform(post("/api/v1/manager/circuit-breaker"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "customer@baskly.money", roles = {"CUSTOMER"})
    @DisplayName("Retail user (CUSTOMER) is forbidden from calling /api/v1/manager/circuit-breaker")
    void testRetailUserForbiddenFromManagerEndpoint() throws Exception {
        mockMvc.perform(post("/api/v1/manager/circuit-breaker"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "manager@baskly.money", roles = {"FUND_MANAGER"})
    @DisplayName("FUND_MANAGER is authorized to toggle circuit breaker")
    void testFundManagerAuthorizedForCircuitBreaker() throws Exception {
        mockMvc.perform(post("/api/v1/manager/circuit-breaker"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Unauthenticated order endpoint /api/v1/orders/redeem is rejected")
    void testUnauthenticatedRedeemOrderRejected() throws Exception {
        WithdrawOrderRequest req = new WithdrawOrderRequest();
        req.setUserId(TEST_USER_ID);
        req.setFundId(TEST_FUND_ID);
        req.setAmountInr(new BigDecimal("500.00"));

        mockMvc.perform(post("/api/v1/orders/redeem")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "demo-user", roles = {"CUSTOMER"})
    @DisplayName("Order validation rejects missing required identifiers with 400 Bad Request")
    void testOrderValidationRejectsMissingIdentifiers() throws Exception {
        BuyOrderRequest missingBasket = new BuyOrderRequest();
        missingBasket.setUserId(TEST_USER_ID);
        missingBasket.setAmountInr(new BigDecimal("1000.00"));

        mockMvc.perform(post("/api/v1/orders/buy")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(missingBasket)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "demo-user", roles = {"CUSTOMER"})
    @DisplayName("Authenticated user order endpoint aliases /orders/buy route cleanly and bind to principal")
    void testAuthenticatedOrderAliasesRouteCleanly() throws Exception {
        BuyOrderRequest buyReq = new BuyOrderRequest();
        buyReq.setUserId(TEST_USER_ID);
        buyReq.setFundId(TEST_FUND_ID);
        buyReq.setAmountInr(new BigDecimal("1000.00"));

        mockMvc.perform(post("/api/v1/orders/buy")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
