# Tetris Desktop Build Script for Windows

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Tetris Desktop Build Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check if virtual environment exists
if (Test-Path ".\.venv\Scripts\Activate.ps1") {
    Write-Host "`n✓ Virtual environment found, activating..." -ForegroundColor Green
    & .\.venv\Scripts\Activate.ps1
} else {
    Write-Host "`n✗ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    & .\.venv\Scripts\Activate.ps1
}

# Check if requirements are installed
Write-Host "`n📦 Installing requirements..." -ForegroundColor Cyan
pip install -q -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install requirements" -ForegroundColor Red
    exit 1
}

# Check if PyInstaller is installed
Write-Host "`n🔍 Checking PyInstaller..." -ForegroundColor Cyan
pip install -q pyinstaller
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install PyInstaller" -ForegroundColor Red
    exit 1
}

# Build the executable
Write-Host "`n🔨 Building executable..." -ForegroundColor Cyan
pyinstaller --clean main.spec

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Build successful!" -ForegroundColor Green
    Write-Host "`n📍 Executable location: dist\main\main.exe" -ForegroundColor Cyan
    Write-Host "`n📦 To share with your friend:" -ForegroundColor Yellow
    Write-Host "   1. Navigate to the 'dist' folder" -ForegroundColor White
    Write-Host "   2. Right-click 'main' folder → 'Send to' → 'Compressed folder'" -ForegroundColor White
    Write-Host "   3. Share the .zip file with your friend" -ForegroundColor White
    Write-Host "   4. They can extract and run main.exe" -ForegroundColor White
} else {
    Write-Host "`n✗ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nPress any key to continue..." -NoNewLine
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
