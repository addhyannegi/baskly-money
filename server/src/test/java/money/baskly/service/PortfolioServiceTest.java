package money.baskly.service;

import money.baskly.dto.BuyOrderRequest;
import money.baskly.dto.TransactionDto;
import money.baskly.dto.WithdrawOrderRequest;
import money.baskly.dto.WithdrawResponseDto;
import money.baskly.entity.BasketEntity;
import money.baskly.entity.PortfolioHoldingEntity;
import money.baskly.entity.TransactionEntity;
import money.baskly.entity.UserEntity;
import money.baskly.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PortfolioServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BasketRepository basketRepository;

    @Mock
    private PortfolioHoldingRepository holdingRepository;

    @Mock
    private UpiMandateRepository mandateRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private PortfolioService portfolioService;

    private UserEntity demoUser;
    private BasketEntity top5Basket;

    @BeforeEach
    void setUp() {
        demoUser = new UserEntity();
        demoUser.setId("usr_demo_retail");
        demoUser.setName("Rohan Verma");
        demoUser.setEmail("rohan@baskly.money");
        demoUser.setCashBalanceInr(new BigDecimal("25000.00"));

        top5Basket = new BasketEntity();
        top5Basket.setId("top-5-index");
        top5Basket.setName("Top-5 Bluechip Index");
        top5Basket.setNav(new BigDecimal("100.0000"));
    }

    @Test
    @DisplayName("Statutory Section 194S 1% TDS deduction on INR withdrawal")
    void testWithdrawalTdsDeduction() {
        when(userRepository.findById("usr_demo_retail")).thenReturn(Optional.of(demoUser));
        when(basketRepository.findById("top-5-index")).thenReturn(Optional.of(top5Basket));

        PortfolioHoldingEntity holding = new PortfolioHoldingEntity();
        holding.setUserId("usr_demo_retail");
        holding.setBasketId("top-5-index");
        holding.setUnits(new BigDecimal("100.000000"));
        holding.setAvgBuyNav(new BigDecimal("100.0000"));
        holding.setInvestedAmountInr(new BigDecimal("10000.00"));

        when(holdingRepository.findByUserIdAndBasketId("usr_demo_retail", "top-5-index"))
                .thenReturn(Optional.of(holding));

        when(transactionRepository.save(any(TransactionEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Withdraw ₹10,000.00
        WithdrawOrderRequest req = new WithdrawOrderRequest("usr_demo_retail", "top-5-index", new BigDecimal("10000.00"));
        WithdrawResponseDto result = portfolioService.withdrawBasket(req);

        assertNotNull(result);
        assertEquals(new BigDecimal("10000.00"), result.getGross());
        // Statutory 1% Section 194S TDS = 10,000 * 0.01 = ₹100.00
        assertEquals(new BigDecimal("100.00"), result.getTds());
        // Net credited = 10,000 - 100 = ₹9,900.00
        assertEquals(new BigDecimal("9900.00"), result.getNet());
        assertEquals("WITHDRAWAL", result.getTx().getType());
        assertEquals(new BigDecimal("100.00"), result.getTx().getTdsINR());
        assertEquals(new BigDecimal("9900.00"), result.getTx().getNetAmountINR());
    }

    @Test
    @DisplayName("Unit allocation and weighted average buy NAV calculation on buy order")
    void testBuyOrderUnitAllocationAndAveraging() {
        when(userRepository.findById("usr_demo_retail")).thenReturn(Optional.of(demoUser));
        when(basketRepository.findById("top-5-index")).thenReturn(Optional.of(top5Basket));

        // Existing holding: 50 units @ ₹100.00 (₹5,000 invested)
        PortfolioHoldingEntity existingHolding = new PortfolioHoldingEntity(
                "usr_demo_retail", "top-5-index",
                new BigDecimal("50.000000"),
                new BigDecimal("100.0000"),
                new BigDecimal("5000.00")
        );
        when(holdingRepository.findByUserIdAndBasketId("usr_demo_retail", "top-5-index"))
                .thenReturn(Optional.of(existingHolding));

        when(transactionRepository.save(any(TransactionEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Buy another ₹5,000 at NAV ₹100.00
        BuyOrderRequest req = new BuyOrderRequest("usr_demo_retail", "top-5-index", new BigDecimal("5000.00"));
        TransactionDto tx = portfolioService.buyBasket(req);

        assertNotNull(tx);
        assertEquals("BUY", tx.getType());
        assertEquals(new BigDecimal("5000.00"), tx.getAmountINR());
        assertEquals(new BigDecimal("50.000000"), tx.getUnits());
        assertEquals(BigDecimal.ZERO, tx.getTdsINR());

        // Verify holding updated: total units = 100, total invested = ₹10,000, avg NAV = ₹100.00
        assertEquals(new BigDecimal("100.000000"), existingHolding.getUnits());
        assertEquals(new BigDecimal("10000.00"), existingHolding.getInvestedAmountInr());
        assertEquals(new BigDecimal("100.0000"), existingHolding.getAvgBuyNav());
    }

    @Test
    @DisplayName("Insufficient holding rejection on excessive withdrawal")
    void testWithdrawalExceedsHoldingThrowsException() {
        when(userRepository.findById("usr_demo_retail")).thenReturn(Optional.of(demoUser));
        when(basketRepository.findById("top-5-index")).thenReturn(Optional.of(top5Basket));

        PortfolioHoldingEntity holding = new PortfolioHoldingEntity();
        holding.setUserId("usr_demo_retail");
        holding.setBasketId("top-5-index");
        holding.setUnits(new BigDecimal("10.000000")); // Value = 10 * 100 = ₹1,000
        holding.setAvgBuyNav(new BigDecimal("100.0000"));
        holding.setInvestedAmountInr(new BigDecimal("1000.00"));

        when(holdingRepository.findByUserIdAndBasketId("usr_demo_retail", "top-5-index"))
                .thenReturn(Optional.of(holding));

        // Attempting to withdraw ₹5,000 when holding value is ₹1,000
        WithdrawOrderRequest req = new WithdrawOrderRequest("usr_demo_retail", "top-5-index", new BigDecimal("5000.00"));

        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
            portfolioService.withdrawBasket(req);
        });

        assertTrue(thrown.getMessage().contains("Insufficient holdings"));
    }
}
