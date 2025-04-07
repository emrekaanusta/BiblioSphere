package com.bibliosphere.backend.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Autowired
    private CloudinaryProperties properties;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", properties.getCloudName());
        config.put("api_key", properties.getApiKey());
        config.put("api_secret", properties.getApiSecret());
        return new Cloudinary(config);
    }
}

