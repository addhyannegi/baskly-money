package money.baskly.dto;

import java.math.BigDecimal;
import java.util.List;

public class BasketDto {
    private String id;
    private String indexNum;
    private String name;
    private String serifWord;
    private String tagline;
    private String description;
    private String risk;
    private String riskColor;
    private BigDecimal fee_pct;
    private BigDecimal min_sip;
    private BigDecimal expected_cagr;
    private BigDecimal nav;
    private BigDecimal change_24h;
    private List<BasketConstituentDto> assets;

    public BasketDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getIndexNum() { return indexNum; }
    public void setIndexNum(String indexNum) { this.indexNum = indexNum; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSerifWord() { return serifWord; }
    public void setSerifWord(String serifWord) { this.serifWord = serifWord; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRisk() { return risk; }
    public void setRisk(String risk) { this.risk = risk; }

    public String getRiskColor() { return riskColor; }
    public void setRiskColor(String riskColor) { this.riskColor = riskColor; }

    public BigDecimal getFee_pct() { return fee_pct; }
    public void setFee_pct(BigDecimal fee_pct) { this.fee_pct = fee_pct; }

    public BigDecimal getMin_sip() { return min_sip; }
    public void setMin_sip(BigDecimal min_sip) { this.min_sip = min_sip; }

    public BigDecimal getExpected_cagr() { return expected_cagr; }
    public void setExpected_cagr(BigDecimal expected_cagr) { this.expected_cagr = expected_cagr; }

    public BigDecimal getNav() { return nav; }
    public void setNav(BigDecimal nav) { this.nav = nav; }

    public BigDecimal getChange_24h() { return change_24h; }
    public void setChange_24h(BigDecimal change_24h) { this.change_24h = change_24h; }

    public List<BasketConstituentDto> getAssets() { return assets; }
    public void setAssets(List<BasketConstituentDto> assets) { this.assets = assets; }
}
