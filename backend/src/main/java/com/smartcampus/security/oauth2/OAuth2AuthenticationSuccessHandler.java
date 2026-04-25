package com.smartcampus.security.oauth2;

import com.smartcampus.security.jwt.JwtTokenProvider;
import com.smartcampus.security.jwt.UserPrincipal;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuth2UserService oAuth2UserService;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        try {
            UserPrincipal principal = oAuth2UserService.processOAuth2User(authentication);
            String token = tokenProvider.generateToken(principal);

            String targetUrl = UriComponentsBuilder
                    .fromUriString(redirectUri)
                    .queryParam("token", token)
                    .build()
                    .toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception ex) {
            log.error("Google OAuth login failed after authentication", ex);

            String failureUrl = UriComponentsBuilder
                    .fromUriString(redirectUri)
                    .replacePath("/login")
                    .replaceQuery("error=oauth2")
                    .build()
                    .toUriString();

            getRedirectStrategy().sendRedirect(request, response, failureUrl);
        }
    }
}
