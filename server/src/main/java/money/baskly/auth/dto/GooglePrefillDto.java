package money.baskly.auth.dto;

public class GooglePrefillDto {

    private String firstName;
    private String lastName;
    private String email;
    private String avatar;
    private String googleVerificationGrant;

    public GooglePrefillDto() {}

    public GooglePrefillDto(String firstName, String lastName, String email, String avatar, String googleVerificationGrant) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.avatar = avatar;
        this.googleVerificationGrant = googleVerificationGrant;
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getGoogleVerificationGrant() { return googleVerificationGrant; }
    public void setGoogleVerificationGrant(String googleVerificationGrant) { this.googleVerificationGrant = googleVerificationGrant; }
}
