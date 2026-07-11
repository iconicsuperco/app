#!/bin/bash

# Start the backend API server
echo "🚀 Starting Muse API server on port 3001..."
cd /Users/ayushgupta/Downloads/Muse
RUST_LOG=info cargo run -p muse-api &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start the frontend dev server
echo "🎨 Starting Muse frontend on port 5173..."
cd /Users/ayushgupta/Downloads/Muse/frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:3001"
echo ""
echo "To stop, press Ctrl+C"

# Wait for both processes
wait
