#!/bin/bash

# MongoDB backup script
# Usage: ./backup_mongodb.sh

# Set variables
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="mongodb_backups"
BACKUP_NAME="backup_${TIMESTAMP}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if mongodump is installed
if ! command -v mongodump &> /dev/null; then
    echo "Error: mongodump is not installed. Please install MongoDB tools first."
    exit 1
fi

# Perform backup
echo "Starting MongoDB backup..."
mongodump \
    --uri "mongodb+srv://bibliosphere.noxmd.mongodb.net/" \
    --username "$MONGODB_USERNAME" \
    --password "$MONGODB_PASSWORD" \
    --authenticationDatabase admin \
    --out "$BACKUP_DIR/$BACKUP_NAME"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully!"
    echo "Backup location: $BACKUP_DIR/$BACKUP_NAME"
else
    echo "Error: Backup failed!"
    exit 1
fi 