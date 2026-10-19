package money.baskly.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "basket_constituents", uniqueConstraints = {
    @UniqueConstraint(name = "uq_basket_symbol", columnNames = {"basket_id", "symbol"})
})
public class BasketConstituentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "basket_id", nullable = false)
    @JsonIgnore
    private BasketEntity basket;

    @Column(name = "symbol", length = 32, nullable = false)
    private String symbol;

    @Column(name = "name", length = 128, nullable = false)
    private String name;

    @Column(name = "weight", precision = 6, scale = 2, nullable = false)
    private BigDecimal weight;

    @Column(name = "color", length = 32)
    private String color;

    @Column(name = "price_inr", precision = 18, scale = 4, nullable = false)
    private BigDecimal priceInr = BigDecimal.ZERO;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public BasketConstituentEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BasketEntity getBasket() { return basket; }
    public void setBasket(BasketEntity basket) { this.basket = basket; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public BigDecimal getPriceInr() { return priceInr; }
    public void setPriceInr(BigDecimal priceInr) { this.priceInr = priceInr; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
