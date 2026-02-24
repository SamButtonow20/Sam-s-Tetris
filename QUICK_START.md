# 🚀 Quick Start - Get Playing in 5 Minutes!

## Option 1: Play Online Together Right Now (Recommended) 🌐

### The Easiest Way:

1. **You deploy the server** (one-time setup)
2. **Your friend just opens a link** - no installation needed!

### For You (Host):

```powershell
cd C:\Users\sambu\Downloads\Tetris\web
npm install
npm start
```

Your local server is now running at `http://localhost:8080`

### Share with Your Friend on Same Network:

1. Find your computer's local IP:
```powershell
ipconfig
# Look for "IPv4 Address" (usually 192.168.x.x)
```

2. Share this link with your friend: `http://YOUR_IP:8080`
3. Both of you enter the same room code
4. Play!

### Share with Friend in Different State (Use Free Hosting):

See [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md) for step-by-step free hosting setup.

---

## Option 2: Download & Run Desktop Game Locally 💻

### Desktop Version:

```powershell
cd C:\Users\sambu\Downloads\Tetris
.\build.ps1
```

This creates `dist/main/main.exe` - ready to send to your friend!

To share:
1. Compress `dist/main` folder
2. Send the .zip file
3. Friend extracts and runs `main.exe`

---

## Option 3: Play on Same Network with Online Server 🏠

If both on same WiFi with Python installed:

```powershell
# Your end
python online_server.py --host 0.0.0.0 --port 5555

# Friend runs desktop and connects to your IP
```

---

## 🎮 How to Play

### Web Version:
1. Open the URL in browser
2. Enter your name
3. Enter a room code (e.g., "room1")
4. Wait for opponent
5. Game starts!

### Controls:
- **← →** : Move
- **↑** : Rotate
- **↓** : Soft drop
- **Space** : Hard drop
- **P** : Pause
- **Esc** : Quit

---

## ❓ Common Questions

**Q: My friend says "Connection timeout"**
A: Make sure your router isn't blocking WebSocket connections. Use Railway.app for reliable hosting.

**Q: Can we play across different countries?**
A: Yes! Deploy to Railway.app or similar service. See [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md).

**Q: Do they need Python/Node installed?**
A: For web version: NO, just a browser
For desktop: NO if you build an .exe, YES if using .py

**Q: How do I get room codes to sync?**
A: Both players enter the same arbitrary code (e.g., "awesome123")

---

## 📞 Troubleshooting

### Web version won't start
```powershell
# Install Node.js from https://nodejs.org/
# Then try again
npm install
npm start
```

### Can't find friend's IP
```powershell
# Run this to find your IP
ipconfig
```

### Friend can't connect
- Check firewall settings
- Try hosting on Railway instead
- Make sure you both entered same room code

---

## 🎯 Recommended Setup

For playing with your friend **in another state**:

1. Read [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)
2. Deploy web version to Railway (5 minutes)
3. Share the URL
4. Play!

This is the most reliable and easiest way. ✨

---

**Questions?** Check SETUP_GUIDE.md for more details!
