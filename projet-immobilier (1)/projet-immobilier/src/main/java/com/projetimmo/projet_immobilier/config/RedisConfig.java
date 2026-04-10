package com.projetimmo.projet_immobilier.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RedisConfig {

    @Value("${spring.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.redis.port:6379}")
    private int redisPort;

    @Value("${spring.redis.password:}")
    private String redisPassword;

    @Value("${spring.redis.database:0}")
    private int redisDatabase;

    @Bean
    @ConditionalOnProperty(name = "redis.enabled", havingValue = "true")
    public RedisConnectionInfo redisConnectionInfo() {
        return new RedisConnectionInfo(redisHost, redisPort, redisPassword, redisDatabase);
    }

    // Configuration Redis sera ajoutée quand les dépendances seront disponibles
    // Pour l'instant, on utilise la configuration conditionnelle

    public static class RedisConnectionInfo {
        private final String host;
        private final int port;
        private final String password;
        private final int database;

        public RedisConnectionInfo(String host, int port, String password, int database) {
            this.host = host;
            this.port = port;
            this.password = password;
            this.database = database;
        }

        public String getHost() { return host; }
        public int getPort() { return port; }
        public String getPassword() { return password; }
        public int getDatabase() { return database; }
    }
}
