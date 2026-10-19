package money.baskly.controller;

import money.baskly.entity.TransactionEntity;
import money.baskly.repository.TransactionRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final TransactionRepository transactionRepository;

    public ReportController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping(value = "/tds", produces = "text/csv")
    public ResponseEntity<byte[]> exportTdsLedger(
            @RequestParam(required = false) String userId) {
        List<TransactionEntity> transactions = userId != null
                ? transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                : transactionRepository.findAllByOrderByCreatedAtDesc();

        StringBuilder csv = new StringBuilder();
        csv.append("Transaction_ID,User_ID,Date,Type,Basket_ID,Gross_Amount_INR,Units,NAV,TDS_Deducted_194S_INR,Net_Amount_INR,Status,Bank_Reference\n");

        for (TransactionEntity tx : transactions) {
            csv.append(escape(tx.getId())).append(",")
               .append(escape(tx.getUserId())).append(",")
               .append(escape(tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : "")).append(",")
               .append(escape(tx.getType())).append(",")
               .append(escape(tx.getBasketId())).append(",")
               .append(tx.getAmountInr()).append(",")
               .append(tx.getUnits()).append(",")
               .append(tx.getNav()).append(",")
               .append(tx.getTdsInr()).append(",")
               .append(tx.getNetAmountInr()).append(",")
               .append(escape(tx.getStatus())).append(",")
               .append(escape(tx.getBankRef() != null ? tx.getBankRef() : "")).append("\n");
        }

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Baskly_TDS_Section194S_Ledger.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }

    private String escape(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
