package com.bibliosphere.backend.model;

public enum OrderStatus {
    PROCESSED,     // just placed / awaiting shipment
    TRANSFER,      // handed to courier
    DELIVERED,     // arrived
    CANCELLED,
    REFUND_PENDING,// user cancelled while still PROCESSED
    REFUNDED
}
