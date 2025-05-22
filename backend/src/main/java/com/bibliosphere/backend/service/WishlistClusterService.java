package com.bibliosphere.backend.service;

import com.bibliosphere.backend.model.WishlistCluster;
import com.bibliosphere.backend.repository.WishlistClusterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WishlistClusterService {

    @Autowired
    private WishlistClusterRepository wishlistClusterRepository;

    public WishlistCluster updateWishlist(String userEmail, String bookId, boolean isAdding) {
        WishlistCluster cluster = wishlistClusterRepository.findByUserEmail(userEmail)
                .orElse(new WishlistCluster());

        if (cluster.getUserEmail() == null) {
            cluster.setUserEmail(userEmail);
        }

        if (isAdding) {
            if (!cluster.getWishlist().contains(bookId)) {
                cluster.getWishlist().add(bookId);
            }
        } else {
            cluster.getWishlist().remove(bookId);
        }

        return wishlistClusterRepository.save(cluster);
    }

    public WishlistCluster getWishlistCluster(String userEmail) {
        return wishlistClusterRepository.findByUserEmail(userEmail)
                .orElse(new WishlistCluster());
    }
} 