package com.projetimmo.projet_immobilier.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VerifyOtpRequest {
    @NotBlank(message = "Le code OTP est obligatoire")
    private String code;

    @NotBlank(message = "L'identifiant (email ou username) est obligatoire")
    private String username;

    private String type; // LOGIN or REGISTER
}
