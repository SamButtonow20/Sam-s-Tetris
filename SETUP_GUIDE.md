# Sam Stackerz - Multiplayer Setup Guide

## Option 1: Web Version (Easiest for Online Play) ⚡

The web version is the easiest way to play online together.

### For Players (Web Version)

1. **No installation needed** - just visit the website!
2. Go to your hosted server URL (e.g., `http://your-server-url:8080`)
3. Enter your player name
4. Enter a room code to join your friend
5. Wait for your opponent to join
6. Play!

### For Hosting the Server

#### Option A: Local Network (Same WiFi)
```bash
cd web
npm install
npm start
```
Then share your computer's local IP (e.g., `192.168.1.100:8080`) with your friend.

#### Option B: Free Hosting (Recommended for Remote Play)
Use one of these free services:

**1. Railway.app** (Recommended)
- Sign up at https://railway.app
- Connect your GitHub repo
- Add environment variables: `PORT=8080`
- Railway will give you a public URL
- Share the URL with your friend

**2. Heroku** (Legacy but still works)
- Sign up at https://www.heroku.com
- Follow their deployment guide for Node.js apps

**3. Replit**
- Go to https://replit.com
- Create new Node.js project
- Upload your `web` folder
- Click "Run"
- Share the public URL

#### Option C: Your Own Server
If you have a home server or VPS:
```bash
# On your server
cd web
npm install
npm start
```

---

## Option 2: Desktop Application (Single Player or LAN)

### Build the Desktop Executable

**Prerequisites:**
- Python 3.8+
- Already installed: PyInstaller

**Build Steps:**
```bash
# Make sure you're in the Tetris directory
cd C:\Users\sambu\Downloads\Tetris

# Activate virtual environment (if you have one)
.\.venv\Scripts\Activate.ps1

# Build the executable
pyinstaller --clean main.spec

# Your executable will be in: dist/main/main.exe
```

**To Share:**
- Zip the `dist/main` folder
- Share with your friend
- They can extract and run `main.exe`
- No Python installation needed!

### Play on LAN (Same Network)
The desktop version can connect to the Python online server:
```bash
python online_server.py --host 0.0.0.0 --port 5555
```
Both players run `main.exe` and connect to the server IP.

---

## Quick Recommendation

**For playing online with your friend in another state:**

1. **Use the Web Version** - it's the easiest
2. **Host on Railway.app or similar** - free and requires no setup
3. **Share the URL** - they just click a link, no installation needed

This is the most user-friendly way to share the game! 🎮

