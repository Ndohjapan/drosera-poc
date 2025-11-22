#!/bin/bash

echo "🔧 Setting up PM2 for Whale Detector Backend"
echo "=============================================="

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# Stop any running node processes
echo "🛑 Stopping existing Node.js processes..."
pkill -f "node.*index.js" || true

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Start with PM2
echo "🚀 Starting backend with PM2..."
pm2 start ecosystem.config.js

# Save PM2 process list
echo "💾 Saving PM2 process list..."
pm2 save

# Setup startup script (run on system reboot)
echo "🔄 Setting up PM2 to start on system reboot..."
pm2 startup

echo ""
echo "=============================================="
echo "✅ Setup Complete!"
echo "=============================================="
echo ""
echo "📊 Useful PM2 Commands:"
echo "  pm2 status              - View app status"
echo "  pm2 logs whale-detector - View live logs"
echo "  pm2 restart whale-detector - Restart app"
echo "  pm2 stop whale-detector - Stop app"
echo "  pm2 delete whale-detector - Remove app from PM2"
echo "  pm2 monit               - Monitor resources"
echo ""
