package money.baskly.auth.model;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Centralized Application User Roles.
 * Supported roles: ADMIN, FUND_MANAGER, CUSTOMER, RETAIL_USER, SUPPORT.
 */
public enum Role {
    ADMIN("ADMIN", "System Administrator", "/dashboard/admin"),
    FUND_MANAGER("FUND_MANAGER", "Institutional Fund Manager", "/dashboard/fund-manager"),
    CUSTOMER("CUSTOMER", "Retail Customer Investor", "/dashboard/customer"),
    RETAIL_USER("CUSTOMER", "Retail Customer Investor", "/dashboard/customer"),
    SUPPORT("SUPPORT", "Customer Support Specialist", "/dashboard/support");

    private final String code;
    private final String description;
    private final String defaultDashboardPath;

    Role(String code, String description, String defaultDashboardPath) {
        this.code = code;
        this.description = description;
        this.defaultDashboardPath = defaultDashboardPath;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public String getDefaultDashboardPath() {
        return defaultDashboardPath;
    }

    public Role toCanonicalRole() {
        return (this == RETAIL_USER) ? CUSTOMER : this;
    }

    public boolean isRetailUser() {
        return this == CUSTOMER || this == RETAIL_USER;
    }

    public boolean isManager() {
        return this == FUND_MANAGER;
    }

    public boolean isAdmin() {
        return this == ADMIN;
    }

    /**
     * Legacy portal compatibility bridge for existing portal routes.
     */
    public String toLegacyPortalRole() {
        if (this == FUND_MANAGER) {
            return "fund_manager";
        }
        return "retail";
    }

    public static Role fromString(String val) {
        if (val == null || val.isBlank()) {
            return CUSTOMER;
        }
        String clean = val.trim().toUpperCase();
        if ("RETAIL".equals(clean) || "INVESTOR".equals(clean) || "USER".equals(clean) || "RETAIL_USER".equals(clean)) {
            return CUSTOMER;
        }
        try {
            return Role.valueOf(clean).toCanonicalRole();
        } catch (IllegalArgumentException ex) {
            return CUSTOMER;
        }
    }
}
