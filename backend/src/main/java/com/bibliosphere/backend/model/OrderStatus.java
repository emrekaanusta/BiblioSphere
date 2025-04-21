package com.bibliosphere.backend.model;

public enum OrderStatus {
    PROCESSED,     // just placed / awaiting shipment
    TRANSFER,      // handed to courier
    DELIVERED,     // arrived
    CANCELLED      // user cancelled while still PROCESSED
}
