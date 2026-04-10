package com.projetimmo.projet_immobilier.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // 🔹 Validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return buildError(
                message,
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_ERROR,
                request);
    }

    // 🔹 Business
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiError> handleBusiness(
            BusinessException ex,
            HttpServletRequest request) {

        return buildError(
                ex.getMessage(),
                HttpStatus.BAD_REQUEST,
                ex.getErrorCode(),
                request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        log.warn("Validation échouée : {}", ex.getMessage());

        return buildError(
                ex.getMessage(),
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_ERROR,
                request);
    }

    // 🔹 Not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request) {

        return buildError(
                ex.getMessage(),
                HttpStatus.NOT_FOUND,
                ex.getErrorCode(),
                request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDatabase(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        String message = "Violation de contrainte base de données";

        Throwable rootCause = ex.getRootCause();
        if (rootCause != null && rootCause.getMessage() != null) {
            String rootMessage = rootCause.getMessage();

            if (rootMessage.contains("unique") || rootMessage.contains("UNIQUE")) {

                int start = rootMessage.indexOf("(");
                int end = rootMessage.indexOf(")");
                if (start != -1 && end != -1 && end > start) {
                    String field = rootMessage.substring(start + 1, end);
                    message = "Le champ '" + field + "' est déjà utilisé.";
                }
            }
        }

        return buildError(
                message,
                HttpStatus.BAD_REQUEST,
                ErrorCode.DATABASE_ERROR,
                request);
    }

    // 🔹 Catch global
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneral(
            Exception ex,
            HttpServletRequest request) {

        log.error("Erreur interne : ", ex);

        return buildError(
                "Erreur interne du serveur",
                HttpStatus.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_ERROR,
                request);
    }

    private ResponseEntity<ApiError> buildError(
            String message,
            HttpStatus status,
            ErrorCode code,
            HttpServletRequest request) {

        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .code(code.name())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(error, status);
    }
}
