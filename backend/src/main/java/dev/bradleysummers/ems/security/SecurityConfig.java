package dev.bradleysummers.ems.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity  // Enable method-level security annotations like @PreAuthorize
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints that don't require authentication
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/setup/**").permitAll()
                        // Add specific security rules for department deletion
                        .requestMatchers("/api/departments/*/delete").hasRole("ADMIN")
                        // POST/PUT/DELETE operations require ADMIN or EMPLOYEE role
                        // Special case for employee creation - allow ADMIN to create users with any role
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/employees")
                        .hasRole("ADMIN")
                        // Other POST operations require ADMIN or EMPLOYEE role
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/**")
                        .hasAnyRole("ADMIN", "EMPLOYEE")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/**")
                        .hasAnyRole("ADMIN", "EMPLOYEE")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/**")
                        .hasAnyRole("ADMIN", "EMPLOYEE")
                        // GUEST can access GET endpoints (read-only)
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}