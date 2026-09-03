# NyayMitra V3 — Start Script for Windows PowerShell
# Equivalent to start.sh

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ⚖️  NyayMitra V3 — Starting Up" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: python not found. Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Check Node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: node not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ── Backend ───────────────────────────────────────────────────
Write-Host "`n[1/3] Starting Backend (FastAPI)..." -ForegroundColor Cyan
$backendDir = Join-Path $scriptDir "backend"
Set-Location $backendDir

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

& ".\venv\Scripts\Activate.ps1"
python -m pip install --upgrade pip
pip install -r requirements.txt

# Copy .env if missing
if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Copied .env.example → .env (add your ANTHROPIC_API_KEY)"
}

Write-Host "Backend starting on http://localhost:8000" -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
}

Start-Sleep 2

# ── Frontend ─────────────────────────────────────────────────
Write-Host "`n[2/3] Starting Frontend (React)..." -ForegroundColor Cyan
$frontendDir = Join-Path $scriptDir "frontend"
Set-Location $frontendDir

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages..."
    npm install
}

Write-Host "Frontend starting on http://localhost:3000" -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    npm start
}

# ── Admin Dashboard ───────────────────────────────────────────
Write-Host "`n[3/3] Admin Dashboard ready" -ForegroundColor Cyan
Write-Host "Open: $(Join-Path $scriptDir 'admin-dashboard\index.html') in your browser" -ForegroundColor Green
Write-Host "Or run: npx live-server admin-dashboard --port=5500" -ForegroundColor Yellow

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  ✅ NyayMitra V3 Running!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  🌐 App:     http://localhost:3000"
Write-Host "  🔧 API:     http://localhost:8000"
Write-Host "  📚 API Docs:http://localhost:8000/docs"
Write-Host "  👮 Admin:   admin-dashboard/index.html"
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all services"

# Wait for jobs
try {
    Wait-Job $backendJob, $frontendJob
} catch {
    Write-Host "Stopping..."
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
}