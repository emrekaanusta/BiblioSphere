package com.bibliosphere.backend.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Component
@ConfigurationProperties(prefix = "cloudinary")
public class CloudinaryProperties {
    private String cloudName;
    private String apiKey;
    private String apiSecret;

}