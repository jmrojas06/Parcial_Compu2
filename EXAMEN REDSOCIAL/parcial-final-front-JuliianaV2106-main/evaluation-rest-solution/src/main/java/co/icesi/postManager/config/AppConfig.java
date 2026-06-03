package co.icesi.postManager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class AppConfig {

    @Bean
    BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(t -> t.configurationSource(corsConfigurationSource()))
                .csrf(c -> c.disable())
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/api/v1/auth/login", "/h2-console/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .sessionManagement(t -> t.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

    CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            var config = new org.springframework.web.cors.CorsConfiguration();
            config.addAllowedOrigin("*");
            config.addAllowedMethod("*");
            config.addAllowedHeader("*");
            return config;
        };
    }
}
