package money.baskly.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Value("${app.auth.dev-mode:true}")
    private boolean devMode;

    @Value("${spring.mail.username:support@baskly.money}")
    private String fromEmail;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    // In-memory audit cache for dev inspection / tests
    private final Map<String, String> devLastOtp = new ConcurrentHashMap<>();

    @Override
    public void sendOtpEmail(String toEmail, String otp, int validityMinutes) {
        String cleanEmail = toEmail.toLowerCase().trim();
        devLastOtp.put(cleanEmail, otp);

        if (devMode || mailSender == null) {
            log.info("\n" +
                    "==========================================================\n" +
                    " [Baskly Dev Mailbox] EMAIL OTP NOTIFICATION\n" +
                    " To: {}\n" +
                    " Subject: Your Baskly.money Verification Code\n" +
                    " OTP Code: {}\n" +
                    " Validity: {} minutes\n" +
                    " (Development mode active - real SMTP delivery bypassed)\n" +
                    "==========================================================",
                    cleanEmail, otp, validityMinutes);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(cleanEmail);
            message.setSubject("Your Baskly.money Verification Code");
            message.setText("Welcome to Baskly.money.\n\n"
                    + "Your one-time verification code is: " + otp + "\n\n"
                    + "This code is valid for " + validityMinutes + " minutes. "
                    + "Do not share this code with anyone.");
            mailSender.send(message);
            log.info("Production OTP email successfully dispatched to {}", cleanEmail);
        } catch (Exception ex) {
            log.error("Failed to dispatch production OTP email to {}: {}", cleanEmail, ex.getMessage());
            throw new RuntimeException("Failed to dispatch email verification OTP. Please try again later.", ex);
        }
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetLink, int validityMinutes) {
        String cleanEmail = toEmail.toLowerCase().trim();

        if (devMode || mailSender == null) {
            log.info("\n" +
                    "==========================================================\n" +
                    " [Baskly Dev Mailbox] PASSWORD RECOVERY LINK\n" +
                    " To: {}\n" +
                    " Reset Link / Token: {}\n" +
                    " Validity: {} minutes\n" +
                    "==========================================================",
                    cleanEmail, resetLink, validityMinutes);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(cleanEmail);
            message.setSubject("Baskly.money Password Reset Request");
            message.setText("Hello,\n\n"
                    + "We received a request to reset your Baskly.money account password.\n\n"
                    + "Reset Token / Link: " + resetLink + "\n\n"
                    + "This link will expire in " + validityMinutes + " minutes. "
                    + "If you did not request this, please ignore this email.");
            mailSender.send(message);
            log.info("Production password reset email dispatched to {}", cleanEmail);
        } catch (Exception ex) {
            log.error("Failed to send password reset email to {}: {}", cleanEmail, ex.getMessage());
            throw new RuntimeException("Failed to dispatch password recovery email.", ex);
        }
    }

    @Override
    public String getLastTestOtp(String email) {
        if (!devMode) return null;
        return devLastOtp.get(email.toLowerCase().trim());
    }
}
