package com.smartcampus.security.oauth2;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.jwt.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OAuth2UserService {

    private final UserRepository userRepository;

    public UserPrincipal processOAuth2User(Authentication authentication) {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");
        String providerId = Objects.toString(oauth2User.getAttribute("sub"), null);

        if (email == null || email.isBlank()) {
            throw new IllegalStateException("Google account email was not provided");
        }

        User user = userRepository.findByEmail(email)
                .map(existing -> updateExistingUser(existing, name, picture, providerId))
                .orElseGet(() -> createGoogleUser(email, name, picture, providerId));

        return UserPrincipal.create(userRepository.save(user));
    }

    private User updateExistingUser(User user, String name, String picture, String providerId) {
        user.setName(name != null && !name.isBlank() ? name : user.getName());
        user.setProfilePicture(picture);
        user.setProvider("google");
        user.setProviderId(providerId);
        user.setEnabled(true);
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.setRoles(Set.of(Role.USER));
        }
        return user;
    }

    private User createGoogleUser(String email, String name, String picture, String providerId) {
        return User.builder()
                .email(email)
                .name(name)
                .profilePicture(picture)
                .password(null)
                .roles(Set.of(Role.USER))
                .provider("google")
                .providerId(providerId)
                .enabled(true)
                .build();
    }
}
