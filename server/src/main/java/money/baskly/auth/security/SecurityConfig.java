package money.baskly.auth.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public Authentication Endpoints
                        .requestMatchers("/api/auth/**", "/api/v1/auth/**").permitAll()

                        // Public Catalog, Funds & General Data Read Endpoints
                        .requestMatchers(HttpMethod.GET, 
                                "/api/baskets/**", "/api/v1/baskets/**",
                                "/api/funds/**", "/api/v1/funds/**",
                                "/api/reports/**", "/api/v1/reports/**").permitAll()

                        // Write operations on funds/baskets (e.g. updating NAV) require FUND_MANAGER or ADMIN
                        .requestMatchers(HttpMethod.POST,
                                "/api/baskets/**", "/api/v1/baskets/**",
                                "/api/funds/**", "/api/v1/funds/**").hasAnyRole("FUND_MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT,
                                "/api/baskets/**", "/api/v1/baskets/**",
                                "/api/funds/**", "/api/v1/funds/**").hasAnyRole("FUND_MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE,
                                "/api/baskets/**", "/api/v1/baskets/**",
                                "/api/funds/**", "/api/v1/funds/**").hasAnyRole("FUND_MANAGER", "ADMIN")

                        // Role-specific authorization
                        .requestMatchers("/api/admin/**", "/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/manager/**", "/api/v1/manager/**").hasAnyRole("FUND_MANAGER", "ADMIN")
                        .requestMatchers("/api/support/**", "/api/v1/support/**").hasAnyRole("SUPPORT", "ADMIN")
                        .requestMatchers("/api/portfolio/**", "/api/v1/portfolio/**",
                                "/api/orders/**", "/api/v1/orders/**",
                                "/api/mandates/**", "/api/v1/mandates/**").permitAll()

                        // Error dispatch & CORS pre-flight
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001",
                "https://baskly.money",
                "https://www.baskly.money"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "X-Session-Token",
                "baggage",
                "sentry-trace"
        ));
        config.setExposedHeaders(List.of("Set-Cookie"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
