package com.bibliosphere.backend.model;

public enum OrderStatus {
    PROCESSED,     // just placed
    TRANSFER,      // handed to courier
    DELIVERED      // arrived
}