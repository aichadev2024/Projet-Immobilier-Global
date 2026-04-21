package com.projetimmo.projet_immobilier.service.interfaces;

import com.projetimmo.projet_immobilier.dto.EnhancedRegisterRequest;
import com.projetimmo.projet_immobilier.dto.LoginRequest;
import com.projetimmo.projet_immobilier.dto.LoginResponse;
import com.projetimmo.projet_immobilier.dto.VerifyOtpRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    void register(EnhancedRegisterRequest request, HttpServletRequest httpRequest);

    void registerWithDocuments(EnhancedRegisterRequest request, MultipartFile rccm, MultipartFile nif, MultipartFile agrement, MultipartFile pieceIdentite, HttpServletRequest httpRequest);

    void logout(String refreshToken);

    Object login(LoginRequest request, HttpServletRequest httpRequest);

    LoginResponse verifyOtp(VerifyOtpRequest request, HttpServletRequest httpRequest);

    LoginResponse refreshToken(String refreshToken);

    void forgotPassword(String email);

    void resetPassword(String email, String otp, String newPassword);

    void changePassword(String username, String oldPassword, String newPassword);

    boolean validateToken(String token);

    void revokeToken(String token);
}
