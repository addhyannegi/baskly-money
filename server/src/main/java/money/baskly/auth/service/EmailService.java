package money.baskly.auth.service;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otp, int validityMinutes);

    void sendPasswordResetEmail(String toEmail, String resetLink, int validityMinutes);

    /**
     * For development testing: returns last sent test OTP for an email if dev mode is enabled.
     */
    String getLastTestOtp(String email);
}
