package money.baskly.dto;

public class RebalanceRequest {

    private String basketId;
    private String managerName;

    public RebalanceRequest() {}

    public RebalanceRequest(String basketId, String managerName) {
        this.basketId = basketId;
        this.managerName = managerName;
    }

    public String getBasketId() { return basketId; }
    public void setBasketId(String basketId) { this.basketId = basketId; }

    public String getFundId() { return basketId; }
    public void setFundId(String fundId) { this.basketId = fundId; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }
}
