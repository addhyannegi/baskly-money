package money.baskly.auth.dto;

import money.baskly.auth.model.AuthAccount;
import money.baskly.auth.model.Role;

import java.time.Instant;

public class UserSummaryDto {

    private String id;
    private String name;
    private String givenName;
    private String email;
    private String avatar;
    private String role; // CUSTOMER, ADMIN, FUND_MANAGER, SUPPORT
    private String legacyRole; // retail, fund_manager (for portal compatibility)
    private String defaultDashboardPath;
    private String kycStatus;
    private String pan;
    private String signedInAt;

    public UserSummaryDto() {}

    public static UserSummaryDto fromAccount(AuthAccount account) {
        if (account == null) return null;
        UserSummaryDto dto = new UserSummaryDto();
        dto.id = account.getId();
        dto.name = account.getFullName();
        dto.givenName = account.getFirstName();
        dto.email = account.getEmail();
        dto.avatar = account.getAvatar() != null ? account.getAvatar()
                : "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeSeed(account.getFullName());
        dto.role = account.getRole().name();
        dto.legacyRole = account.getRole().toLegacyPortalRole();
        dto.defaultDashboardPath = account.getRole().getDefaultDashboardPath();
        dto.kycStatus = "VERIFIED";
        dto.pan = "ABCDE" + Math.abs(account.getEmail().hashCode() % 9000 + 1000) + "F";
        dto.signedInAt = Instant.now().toString();
        return dto;
    }

    private static String encodeSeed(String name) {
        if (name == null || name.isBlank()) return "BasklyUser";
        return name.replaceAll("\\s+", "");
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGivenName() { return givenName; }
    public void setGivenName(String givenName) { this.givenName = givenName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getLegacyRole() { return legacyRole; }
    public void setLegacyRole(String legacyRole) { this.legacyRole = legacyRole; }

    public String getDefaultDashboardPath() { return defaultDashboardPath; }
    public void setDefaultDashboardPath(String defaultDashboardPath) { this.defaultDashboardPath = defaultDashboardPath; }

    public String getKycStatus() { return kycStatus; }
    public void setKycStatus(String kycStatus) { this.kycStatus = kycStatus; }

    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }

    public String getSignedInAt() { return signedInAt; }
    public void setSignedInAt(String signedInAt) { this.signedInAt = signedInAt; }
}
