package com.bibliosphere.backend.exception;

public class OutOfStockException extends RuntimeException {
    public OutOfStockException(String title) {
        super("Out of stock: " + title);
    }
}
