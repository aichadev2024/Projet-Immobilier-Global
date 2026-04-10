package com.projetimmo.projet_immobilier.exceptions;

import lombok.Getter;

@Getter
public class ResourceNotFoundException extends RuntimeException {

    private final ErrorCode errorCode = ErrorCode.RESOURCE_NOT_FOUND;

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
