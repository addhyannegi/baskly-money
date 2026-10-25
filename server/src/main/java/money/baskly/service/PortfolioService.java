package money.baskly.service;

import money.baskly.auth.model.AuthAccount;
import money.baskly.auth.repository.AuthAccountRepository;
import money.baskly.dto.*;
import money.baskly.entity.*;
import money.baskly.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    // Statutory 1% Section 194S TDS rate under Indian Income Tax Act for VDA transfers
    public static final BigDecimal TDS_RATE_194S = new BigDecimal("0.01");

    private final UserRepository userRepository;
    private final BasketRepository basketRepository;
    private final PortfolioHoldingRepository holdingRepository;
    private final UpiMandateRepository mandateRepository;
    private final TransactionRepository transactionRepository;
    private final AuthAccountRepository authAccountRepository;

    @Autowired
    public PortfolioService(UserRepository userRepository,
                            BasketRepository basketRepository,
                            PortfolioHoldingRepository holdingRepository,
                            UpiMandateRepository mandateRepository,
                            TransactionRepository transactionRepository,
                            @Autowired(required = false) AuthAccountRepository authAccountRepository) {
        this.userRepository = userRepository;
        this.basketRepository = basketRepository;
        this.holdingRepository = holdingRepository;
        this.mandateRepository = mandateRepository;
        this.transactionRepository = transactionRepository;
        this.authAccountRepository = authAccountRepository;
    }

    public PortfolioService(UserRepository userRepository,
                            BasketRepository basketRepository,
                            PortfolioHoldingRepository holdingRepository,
                            UpiMandateRepository mandateRepository,
                            TransactionRepository transactionRepository) {
        this(userRepository, basketRepository, holdingRepository, mandateRepository, transactionRepository, null);
    }

    public UserEntity resolveUser(String userIdOrEmailOrAuthId) {
        final String lookupKey = (userIdOrEmailOrAuthId == null || userIdOrEmailOrAuthId.isBlank())
                ? "demo-user"
                : userIdOrEmailOrAuthId;

        // 1. Direct lookup by users.id
        Optional<UserEntity> byId = userRepository.findById(lookupKey);
        if (byId.isPresent()) {
            return byId.get();
        }

        // 2. Direct lookup by users.email
        Optional<UserEntity> byEmail = userRepository.findByEmail(lookupKey);
        if (byEmail.isPresent()) {
            return byEmail.get();
        }

        // 3. Lookup in auth_accounts by id or email and synchronize with users table
        if (authAccountRepository != null) {
            Optional<AuthAccount> authAccount = authAccountRepository.findById(lookupKey)
                    .or(() -> authAccountRepository.findByEmail(lookupKey));

            if (authAccount.isPresent()) {
                AuthAccount acc = authAccount.get();
                // Check if users table already has a record with this email
                Optional<UserEntity> existingByEmail = userRepository.findByEmail(acc.getEmail());
                if (existingByEmail.isPresent()) {
                    return existingByEmail.get();
                }

                // If not found in users table, provision a synchronized UserEntity so FK constraints succeed
                UserEntity syncedUser = new UserEntity(
                        acc.getId(),
                        acc.getFullName(),
                        acc.getEmail(),
                        acc.getAvatar(),
                        acc.getFirstName(),
                        acc.getRole() != null ? acc.getRole().toLegacyPortalRole() : "retail",
                        "VERIFIED",
                        null,
                        new BigDecimal("25000.00")
                );
                return userRepository.save(syncedUser);
            }
        }

        // 4. Fallback for demo users
        if ("usr_demo_retail".equalsIgnoreCase(lookupKey)) {
            return userRepository.findById("demo-user")
                    .or(() -> userRepository.findByEmail("vikram.m@example.com"))
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + lookupKey));
        }

        throw new IllegalArgumentException("User not found: " + lookupKey);
    }

    @Transactional
    public TransactionDto buyBasket(BuyOrderRequest request) {
        UserEntity user = resolveUser(request.getUserId());

        BasketEntity basket = basketRepository.findById(request.getBasketId())
                .orElseThrow(() -> new IllegalArgumentException("Basket not found: " + request.getBasketId()));

        BigDecimal amount = request.getAmountInr().setScale(2, RoundingMode.HALF_UP);
        BigDecimal nav = basket.getNav();
        if (nav.compareTo(BigDecimal.ZERO) <= 0) {
            throw illegalState("Basket NAV must be greater than zero");
        }

        // Units allocation: amount / nav (6 decimal places)
        BigDecimal allocatedUnits = amount.divide(nav, 6, RoundingMode.HALF_UP);

        // Update or create holding
        PortfolioHoldingEntity holding = holdingRepository.findByUserIdAndBasketId(user.getId(), basket.getId())
                .orElse(new PortfolioHoldingEntity(user.getId(), basket.getId(), BigDecimal.ZERO, nav, BigDecimal.ZERO));

        BigDecimal prevUnits = holding.getUnits();
        BigDecimal prevInvested = holding.getInvestedAmountInr();

        BigDecimal newUnits = prevUnits.add(allocatedUnits);
        BigDecimal newInvested = prevInvested.add(amount);

        // Weighted Average Buy NAV: newInvested / newUnits
        BigDecimal weightedAvgNav = newUnits.compareTo(BigDecimal.ZERO) > 0
                ? newInvested.divide(newUnits, 4, RoundingMode.HALF_UP)
                : nav;

        holding.setUnits(newUnits);
        holding.setInvestedAmountInr(newInvested);
        holding.setAvgBuyNav(weightedAvgNav);
        holding.setStatus("ACTIVE");
        holding.setUpdatedAt(Instant.now());
        holdingRepository.save(holding);

        // Create Settled Transaction
        String txId = "tx_" + UUID.randomUUID().toString().substring(0, 8);
        String bankRef = "UPI-" + Math.round(1000 + Math.random() * 8999) + "-B" + Math.round(1000 + Math.random() * 8999);
        TransactionEntity tx = new TransactionEntity(
                txId,
                user.getId(),
                basket.getId(),
                "BUY",
                amount,
                allocatedUnits,
                nav,
                BigDecimal.ZERO,
                amount,
                "SETTLED",
                bankRef
        );
        tx = transactionRepository.save(tx);

        return toTransactionDto(tx, basket.getName());
    }

    @Transactional
    public WithdrawResponseDto withdrawBasket(WithdrawOrderRequest request) {
        UserEntity user = resolveUser(request.getUserId());

        BasketEntity basket = basketRepository.findById(request.getBasketId())
                .orElseThrow(() -> new IllegalArgumentException("Basket not found: " + request.getBasketId()));

        PortfolioHoldingEntity holding = holdingRepository.findByUserIdAndBasketId(user.getId(), basket.getId())
                .orElseThrow(() -> new IllegalArgumentException("No existing holding found in basket " + basket.getName()));

        BigDecimal liveNav = basket.getNav();
        BigDecimal grossAmount = request.getAmountInr().setScale(2, RoundingMode.HALF_UP);
        BigDecimal holdingVal = holding.getUnits().multiply(liveNav).setScale(2, RoundingMode.HALF_UP);

        if (grossAmount.compareTo(holdingVal) > 0) {
            throw new IllegalArgumentException("Insufficient holdings: Available ₹" + holdingVal + ", Requested ₹" + grossAmount);
        }

        // Units to redeem
        BigDecimal unitsToRedeem = grossAmount.divide(liveNav, 6, RoundingMode.HALF_UP);
        if (unitsToRedeem.compareTo(holding.getUnits()) > 0) {
            unitsToRedeem = holding.getUnits();
        }

        // Statutory 1% Section 194S TDS deduction
        BigDecimal tdsAmount = grossAmount.multiply(TDS_RATE_194S).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netAmount = grossAmount.subtract(tdsAmount).setScale(2, RoundingMode.HALF_UP);

        // Adjust holding
        BigDecimal remainingUnits = holding.getUnits().subtract(unitsToRedeem);
        if (remainingUnits.compareTo(new BigDecimal("0.000001")) <= 0) {
            holdingRepository.delete(holding);
        } else {
            // Proportionally reduce invested amount
            BigDecimal proportionRemaining = remainingUnits.divide(holding.getUnits(), 6, RoundingMode.HALF_UP);
            BigDecimal remainingInvested = holding.getInvestedAmountInr().multiply(proportionRemaining).setScale(2, RoundingMode.HALF_UP);
            holding.setUnits(remainingUnits);
            holding.setInvestedAmountInr(remainingInvested);
            holding.setUpdatedAt(Instant.now());
            holdingRepository.save(holding);
        }

        // Record Withdrawal Transaction
        String txId = "tx_wd_" + UUID.randomUUID().toString().substring(0, 8);
        String bankRef = "NEFT-IMPS-TDS194S-" + Math.round(1000 + Math.random() * 8999);
        TransactionEntity tx = new TransactionEntity(
                txId,
                user.getId(),
                basket.getId(),
                "WITHDRAWAL",
                grossAmount,
                unitsToRedeem,
                liveNav,
                tdsAmount,
                netAmount,
                "CREDITED_TO_BANK",
                bankRef
        );
        tx = transactionRepository.save(tx);

        return new WithdrawResponseDto(grossAmount, tdsAmount, netAmount, toTransactionDto(tx, basket.getName()));
    }

    @Transactional
    public MandateDto toggleMandate(String mandateId) {
        UpiMandateEntity mandate = mandateRepository.findById(mandateId)
                .orElseThrow(() -> new IllegalArgumentException("Mandate not found: " + mandateId));

        if ("ACTIVE".equalsIgnoreCase(mandate.getStatus())) {
            mandate.setStatus("PAUSED");
        } else {
            mandate.setStatus("ACTIVE");
        }
        mandate.setUpdatedAt(Instant.now());
        mandate = mandateRepository.save(mandate);

        String basketName = basketRepository.findById(mandate.getBasketId())
                .map(BasketEntity::getName)
                .orElse(mandate.getBasketId());

        return toMandateDto(mandate, basketName);
    }

    @Transactional
    public MandateDto createMandate(MandateCreateRequest request) {
        UserEntity user = resolveUser(request.getUserId());

        BasketEntity basket = basketRepository.findById(request.getBasketId())
                .orElseThrow(() -> new IllegalArgumentException("Basket not found: " + request.getBasketId()));

        String mandateId = "mandate_" + UUID.randomUUID().toString().substring(0, 8);
        LocalDate nextDebit = LocalDate.now().plusMonths(1).withDayOfMonth(
                Math.min(request.getDebitDay(), 28)
        );

        UpiMandateEntity mandate = new UpiMandateEntity();
        mandate.setId(mandateId);
        mandate.setUserId(user.getId());
        mandate.setBasketId(basket.getId());
        mandate.setMonthlyAmountInr(request.getMonthlyAmountInr().setScale(2, RoundingMode.HALF_UP));
        mandate.setDebitDay(request.getDebitDay());
        mandate.setStatus("ACTIVE");
        mandate.setVpa(request.getVpa());
        mandate.setNextDebitDate(nextDebit);

        mandate = mandateRepository.save(mandate);
        return toMandateDto(mandate, basket.getName());
    }

    @Transactional(readOnly = true)
    public PortfolioDto getPortfolio(String userId) {
        UserEntity user = resolveUser(userId);

        List<PortfolioHoldingEntity> holdings = holdingRepository.findByUserId(user.getId());
        List<HoldingDto> holdingDtos = new ArrayList<>();

        for (PortfolioHoldingEntity h : holdings) {
            BasketEntity basket = basketRepository.findById(h.getBasketId()).orElse(null);
            String basketName = basket != null ? basket.getName() : h.getBasketId();
            BigDecimal liveNav = basket != null ? basket.getNav() : h.getAvgBuyNav();

            BigDecimal currentValue = h.getUnits().multiply(liveNav).setScale(2, RoundingMode.HALF_UP);
            BigDecimal profit = currentValue.subtract(h.getInvestedAmountInr()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal returnPct = h.getInvestedAmountInr().compareTo(BigDecimal.ZERO) > 0
                    ? profit.divide(h.getInvestedAmountInr(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            HoldingDto dto = new HoldingDto();
            dto.setBasketId(h.getBasketId());
            dto.setBasketName(basketName);
            dto.setUnits(h.getUnits());
            dto.setAvgBuyNav(h.getAvgBuyNav());
            dto.setInvestedAmountINR(h.getInvestedAmountInr());
            dto.setPurchasedDate(h.getCreatedAt().toString());
            dto.setLiveNav(liveNav);
            dto.setCurrentValueINR(currentValue);
            dto.setProfitINR(profit);
            dto.setReturnPct(returnPct);
            dto.setStatus(h.getStatus() != null ? h.getStatus() : "ACTIVE");
            holdingDtos.add(dto);
        }

        List<MandateDto> mandateDtos = mandateRepository.findByUserId(user.getId()).stream()
                .map(m -> {
                    String bName = basketRepository.findById(m.getBasketId()).map(BasketEntity::getName).orElse(m.getBasketId());
                    return toMandateDto(m, bName);
                })
                .collect(Collectors.toList());

        List<TransactionDto> txDtos = transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(t -> {
                    String bName = basketRepository.findById(t.getBasketId()).map(BasketEntity::getName).orElse(t.getBasketId());
                    return toTransactionDto(t, bName);
                })
                .collect(Collectors.toList());

        PortfolioDto portfolio = new PortfolioDto();
        portfolio.setCashBalanceINR(user.getCashBalanceInr());
        portfolio.setHoldings(holdingDtos);
        portfolio.setMandates(mandateDtos);
        portfolio.setTransactions(txDtos);
        portfolio.setGrowthHistory(createSampleGrowthHistory());

        return portfolio;
    }

    private List<GrowthPointDto> createSampleGrowthHistory() {
        List<GrowthPointDto> history = new ArrayList<>();
        history.add(new GrowthPointDto("May '26", new BigDecimal("50000"), new BigDecimal("52400")));
        history.add(new GrowthPointDto("Jun '26", new BigDecimal("100000"), new BigDecimal("109100")));
        history.add(new GrowthPointDto("Jul '26", new BigDecimal("150000"), new BigDecimal("168300")));
        history.add(new GrowthPointDto("Aug '26", new BigDecimal("200000"), new BigDecimal("231400")));
        history.add(new GrowthPointDto("Sep '26", new BigDecimal("250000"), new BigDecimal("289500")));
        history.add(new GrowthPointDto("Oct '26", new BigDecimal("300000"), new BigDecimal("354890")));
        return history;
    }

    private TransactionDto toTransactionDto(TransactionEntity t, String basketName) {
        TransactionDto dto = new TransactionDto();
        dto.setId(t.getId());
        dto.setTimestamp(t.getCreatedAt().toString());
        dto.setType(t.getType());
        dto.setBasketId(t.getBasketId());
        dto.setBasketName(basketName);
        dto.setAmountINR(t.getAmountInr());
        dto.setUnits(t.getUnits());
        dto.setNav(t.getNav());
        dto.setTdsINR(t.getTdsInr());
        dto.setNetAmountINR(t.getNetAmountInr());
        dto.setStatus(t.getStatus());
        dto.setBankRef(t.getBankRef());
        return dto;
    }

    private MandateDto toMandateDto(UpiMandateEntity m, String basketName) {
        MandateDto dto = new MandateDto();
        dto.setId(m.getId());
        dto.setBasketId(m.getBasketId());
        dto.setBasketName(basketName);
        dto.setMonthlyAmountINR(m.getMonthlyAmountInr());
        dto.setDebitDay(m.getDebitDay());
        dto.setStatus(m.getStatus());
        dto.setVpa(m.getVpa());
        dto.setNextDebitDate(m.getNextDebitDate().toString());
        return dto;
    }

    private IllegalArgumentException illegalState(String message) {
        return new IllegalArgumentException(message);
    }
}
