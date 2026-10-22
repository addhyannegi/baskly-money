package money.baskly.auth.model;

/**
 * Centralized Application User Roles.
 * Supported roles: ADMIN, FUND_MANAGER, CUSTOMER, SUPPORT.
 */
public enum Role {
    ADMIN("ADMIN", "System Administrator", "/dashboard/admin"),
    FUND_MANAGER("FUND_MANAGER", "Institutional Fund Manager", "/dashboard/fund-manager"),
    CUSTOMER("CUSTOMER", "Retail Customer Investor", "/dashboard/customer"),
    SUPPORT("SUPPORT", "Customer Support Specialist", "/dashboard/support");

    private final String code;
    private final String description;
    private final String defaultDashboardPath;

    Role(String code, String description, String defaultDashboardPath) {
        this.code = code;
        this.description = description;
        this.defaultDashboardPath = defaultDashboardPath;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public String getDefaultDashboardPath() {
        return defaultDashboardPath;
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
        if ("RETAIL".equals(clean) || "INVESTOR".equals(clean)) {
            return CUSTOMER;
        }
        try {
            return Role.valueOf(clean);
        } catch (IllegalArgumentException ex) {
            return CUSTOMER;
        }
    }
}
