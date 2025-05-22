package com.bibliosphere.backend.controller;

import com.bibliosphere.backend.model.WishlistCluster;
import com.bibliosphere.backend.service.WishlistClusterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist-cluster")
public class WishlistClusterController {

    @Autowired
    private WishlistClusterService wishlistClusterService;

    @PostMapping("/update")
    public ResponseEntity<WishlistCluster> updateWishlistCluster(
            @RequestParam String userEmail,
            @RequestParam String bookId,
            @RequestParam boolean isAdding) {
        WishlistCluster updatedCluster = wishlistClusterService.updateWishlist(userEmail, bookId, isAdding);
        return ResponseEntity.ok(updatedCluster);
    }

    @GetMapping("/{userEmail}")
    public ResponseEntity<WishlistCluster> getWishlistCluster(@PathVariable String userEmail) {
        WishlistCluster cluster = wishlistClusterService.getWishlistCluster(userEmail);
        return ResponseEntity.ok(cluster);
    }
} 