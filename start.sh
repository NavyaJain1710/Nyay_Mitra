#!/bin/bash
# NyayMitra V3 — Start Script
set -e

echo "=========================================="
echo "  ⚖️  NyayMitra V3 — Starting Up"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
TEAL='\033[0;36m'
NC='\033[0m'

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 not found. Please install Python 3.9+"; exit 1
fi

# Check Node
if ! command -v node &>/dev/null; then
  echo "ERROR: node not found. Please install Node.js 18+"; exit 1
fi

# ── Backend ───────────────────────────────────────────────────
echo -e "\n${TEAL}[1/3] Starting Backend (FastAPI)...${NC}"
cd "$(dirname "$0")/backend"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate
pip install -q --upgrade pip
pip install -q fastapi uvicorn python-multipart python-dotenv httpx

# Copy .env if missing
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  echo "Copied .env.example → .env (add your ANTHROPIC_API_KEY)"
fi

echo -e "${GREEN}Backend starting on http://localhost:8000${NC}"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
sleep 2

# ── Frontend ─────────────────────────────────────────────────
echo -e "\n${TEAL}[2/3] Starting Frontend (React)...${NC}"
cd "$(dirname "$0")/frontend"

if [ ! -d "node_modules" ]; then
  echo "Installing npm packages..."
  npm install --silent
fi

echo -e "${GREEN}Frontend starting on http://localhost:3000${NC}"
npm start &
FRONTEND_PID=$!

# ── Admin Dashboard ───────────────────────────────────────────
echo -e "\n${TEAL}[3/3] Admin Dashboard ready${NC}"
echo -e "${GREEN}Open: $(dirname "$0")/admin-dashboard/index.html in your browser${NC}"
echo -e "Or run: ${YELLOW}npx live-server admin-dashboard --port=5500${NC}"

echo ""
echo "=========================================="
echo -e "  ${GREEN}✅ NyayMitra V3 Running!${NC}"
echo "=========================================="
echo "  🌐 App:     http://localhost:3000"
echo "  🔧 API:     http://localhost:8000"
echo "  📚 API Docs:http://localhost:8000/docs"
echo "  👮 Admin:   admin-dashboard/index.html"
echo "=========================================="
echo ""
echo "Press Ctrl+C to stop all services"

# Wait and cleanup
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
