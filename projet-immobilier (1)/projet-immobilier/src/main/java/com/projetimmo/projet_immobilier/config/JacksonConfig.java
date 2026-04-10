package com.projetimmo.projet_immobilier.config;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilder objectMapperBuilder() {
        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder();
        
        // Register JavaTimeModule for JDK 8 date/time types
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        
        // Serialize LocalDateTime as ISO string instead of array
        javaTimeModule.addSerializer(LocalDateTime.class, 
            new com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer(
                DateTimeFormatter.ISO_LOCAL_DATE_TIME
            ));
        
        builder.modules(javaTimeModule);
        
        // Disable writing dates as timestamps (arrays)
        builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return builder;
    }
}
