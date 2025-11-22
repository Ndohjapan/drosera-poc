#!/bin/bash

# Quick Setup Script for PM2 on VPS
# Run this on your VPS after pulling the code

echo "🚀 Whale Detector - PM2 Quick Setup"
echo "===================================="

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
cd ~/whale-detector-poc
git pull origin master

# Kill existing node processes
echo "🛑 Stopping any existing Node.js processes..."
pkill -f "node.*index.js" || true

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
cd backend
npm install
cd ..

# Start with PM2
echo "🚀 Starting with PM2..."
pm2 start ecosystem.config.js

# Save and setup startup
pm2 save
echo "✅ PM2 setup complete!"

echo ""
echo "📊 Quick Commands:"
echo "  pm2 logs whale-detector  - View logs"
echo "  pm2 restart whale-detector - Restart"
echo "  pm2 status - Check status"
echo ""
