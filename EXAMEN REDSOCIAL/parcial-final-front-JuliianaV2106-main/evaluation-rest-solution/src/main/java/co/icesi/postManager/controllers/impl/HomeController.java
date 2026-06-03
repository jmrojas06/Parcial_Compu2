package co.icesi.postManager.controllers.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.icesi.postManager.dtos.LoginDtoIn;
import co.icesi.postManager.dtos.LoginDtoOut;
import co.icesi.postManager.model.User;
import co.icesi.postManager.services.impl.UserServiceImp;
import co.icesi.postManager.utils.JwtService;


@RestController
@RequestMapping("/api/v1/auth")
public class HomeController {
    
    @Autowired
    private UserServiceImp userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<LoginDtoOut> home(@RequestBody LoginDtoIn user) {

        UserDetails userDetails = userService.loadUserByUsername(user.getUsername());
        if (userDetails == null) {
            return ResponseEntity.badRequest().body(null);
        }
        if (!passwordEncoder.matches(user.getPassword(), userDetails.getPassword())) {
            return ResponseEntity.badRequest().body(null);
        }
        String token = jwtService.generateToken(
            new UsernamePasswordAuthenticationToken(userDetails,"", userDetails.getAuthorities()));
        User userEntity = userService.findByUsername(user.getUsername());
        LoginDtoOut loginDtoOut = new LoginDtoOut();
        loginDtoOut.setToken(token);
        loginDtoOut.setUsername(userDetails.getUsername());
        loginDtoOut.setRoles(userDetails.getAuthorities().stream()
            .map(authority -> authority.getAuthority())
            .toList());
        loginDtoOut.setName(userEntity.getFirstName());
        loginDtoOut.setUserId(userEntity.getId());
        loginDtoOut.setLastName(userEntity.getLastName());
        return ResponseEntity.ok(loginDtoOut);
    }

}