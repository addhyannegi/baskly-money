package money.baskly.dto;

import java.math.BigDecimal;

public class WithdrawResponseDto {
    private BigDecimal gross;
    private BigDecimal tds;
    private BigDecimal net;
    private TransactionDto tx;

    public WithdrawResponseDto() {}

    public WithdrawResponseDto(BigDecimal gross, BigDecimal tds, BigDecimal net, TransactionDto tx) {
        this.gross = gross;
        this.tds = tds;
        this.net = net;
        this.tx = tx;
    }

    public BigDecimal getGross() { return gross; }
    public void setGross(BigDecimal gross) { this.gross = gross; }

    public BigDecimal getTds() { return tds; }
    public void setTds(BigDecimal tds) { this.tds = tds; }

    public BigDecimal getNet() { return net; }
    public void setNet(BigDecimal net) { this.net = net; }

    public TransactionDto getTx() { return tx; }
    public void setTx(TransactionDto tx) { this.tx = tx; }
}
