# Complete Guide: Play Sam Stackerz Online with Your Friend

This guide will help you share your Sam Stackerz game with your friend in another state.

## 📋 Overview

You have **3 ways** to play together:

| Option | Setup Time | Friends Need | Best For |
|--------|-----------|-------------|----------|
| **Web + Railway** (Recommended) | 10 min | Just a browser link | Different states, easiest |
| **Web + Local Network** | 5 min | Same WiFi | Local play at home |
| **Desktop Executable** | 15 min | Download a file | LAN parties |

---

## 🌟 RECOMMENDED: Deploy to Railway.app

This is the **easiest way** for your friend in another state.

### What You Do (One-time Setup)

1. **Install Git** (if not already installed)
   - Download from https://git-scm.com/

2. **Create GitHub Account**
   - Go to https://github.com and sign up (free)

3. **Push Your Game to GitHub**

   ```powershell
   cd C:\Users\sambu\Downloads\Tetris
   git init
   git add .
   git commit -m "Initial Tetris game"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tetris.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your actual GitHub username.

4. **Deploy to Railway.app**

   - Go to https://railway.app and sign up (free, use GitHub login)
   - Click "Start a New Project"
   - Select "Deploy from GitHub"
   - Choose your `tetris` repository
   - Railway automatically detects it's a Node.js app
   - Click "Deploy"
   - Wait 2-3 minutes for deployment

5. **Get Your Public URL**

   - Go to Railway dashboard
   - Click your project
   - Look for "Domains" section
   - You'll see a URL like: `https://tetris-xxxxx.railway.app`

### What Your Friend Does

1. Open the link you sent them in their browser
2. Enter their name
3. Enter a room code (any word, e.g., "room1")
4. Tell you the room code
5. You enter the same room code
6. **Game starts automatically!** 🎮

### That's It! 

No installation, no technical knowledge needed for them!

---

## 🏠 ALTERNATIVE: Web Version on Local Network

Use this if you're on the same WiFi network.

### Step 1: Find Your Computer's IP

```powershell
ipconfig
```

Look for a line like: `IPv4 Address: 192.168.1.100`

### Step 2: Start the Server

```powershell
cd C:\Users\sambu\Downloads\Tetris\web
npm install
npm start
```

You'll see: `Server running on port 8080`

### Step 3: Share with Friend

Send them this URL: `http://192.168.1.100:8080`
(Replace `192.168.1.100` with your actual IP)

### Firewall Note

If they can't connect, your firewall might be blocking it. 
- Windows Defender → Allow Node.js through firewall
- Or temporarily disable firewall for testing

---

## 💻 ALTERNATIVE: Build Desktop Executable

### One-Time Build

```powershell
cd C:\Users\sambu\Downloads\Tetris
.\build.ps1
```

Wait for: ✓ Build successful!

### Share with Friend

1. Navigate to `dist/main` folder
2. Right-click → "Send to" → "Compressed folder"
3. Send the .zip file to your friend
4. They extract and run `main.exe`
5. Desktop game launches (no installation needed!)

**Note:** This version is single-player. For multiplayer, use the web version.

---

## 🎮 How to Play

### Starting a Game

1. Open game (browser or desktop)
2. Enter your player name
3. Enter a room code (any unique code, e.g., "epic-room" or "session-1")
4. Wait for opponent to join same room
5. Game starts!

### Controls

```
LEFT ARROW  / RIGHT ARROW  → Move piece
UP ARROW                   → Rotate
DOWN ARROW                 → Soft drop
SPACE                      → Hard drop
P                          → Pause
ESC                        → Quit
```

### Scoring

- Complete lines to earn points
- Multiple lines at once = combo bonus
- First to 75+ lines often wins!

---

## 🔧 Troubleshooting

### "Connection timeout"
- **Web version:** Check your internet connection
- **Local network:** Make sure friend is on same WiFi
- **Solution:** Try Railway.app instead

### "Room is full"
- Only 2 players per room
- Use a different room code

### "Server won't start"
```powershell
# Install/reinstall Node.js
# Download from https://nodejs.org/ (LTS version)
# Then try again:
npm install
npm start
```

### "Can't find friend's computer"
```powershell
# Check your IP again
ipconfig
# Send them that IP (192.168.x.x or similar)
# Make sure they can ping your IP:
ping YOUR_IP
```

### Build fails
```powershell
# Make sure PyInstaller is installed
pip install pyinstaller
# Then try build again
.\build.ps1
```

---

## 📊 Setup Comparison

### Railway.app (✅ Best for Different States)
- ✅ Works anywhere, any device
- ✅ Friend just opens link
- ✅ Always available
- ❌ Free tier has some limits
- ⏱️ 10 min to set up

### Local Network (✅ Best for Home)
- ✅ Super fast, no lag
- ✅ Free forever
- ✅ Easy to set up
- ❌ Only works on same WiFi
- ⏱️ 5 min to set up

### Desktop Executable (✅ Best for Offline)
- ✅ No internet needed
- ✅ Single-player works
- ❌ Not multiplayer-ready
- ❌ Needs .zip file
- ⏱️ 15 min to build

---

## 🚀 Next Steps

**Choose one and follow along:**

1. **Want easiest setup?** → Deploy to Railway.app (above)
2. **On same WiFi?** → Use local network (above)
3. **Want offline version?** → Build executable (above)

---

## 💡 Pro Tips

1. **Use descriptive room codes**
   - Instead of "room1" use "sam-vs-alex"
   - Easier to remember

2. **Test locally first**
   - Run `npm start` and visit `http://localhost:8080`
   - Play against yourself to learn game

3. **Browser tips**
   - Works on Chrome, Firefox, Safari, Edge
   - Mobile browsers work too!
   - Fullscreen for better experience (F11)

4. **Game hosts**
   - Server can handle multiple simultaneous games
   - Each room is independent
   - No limit on number of rooms

---

## ❓ FAQ

**Q: Does my friend need to install anything for Railway version?**
A: NO! Just a modern web browser. That's it.

**Q: Can we play across countries?**
A: YES! Railway.app works worldwide.

**Q: How much does Railway cost?**
A: FREE for this project! (up to certain limits)

**Q: Can more than 2 people play?**
A: Currently supports 2 per room, but you can create multiple rooms

**Q: Do we need the same operating system?**
A: NO! Web version works on Windows, Mac, Linux, mobile, etc.

**Q: How long can we play?**
A: As long as you want! Railway runs 24/7.

---

## 🎓 Advanced: Host Your Own Server

If you have a VPS or home server:

```bash
# SSH into your server, then:
cd /path/to/tetris/web
npm install
node server.js
```

Point your domain/IP to port 8080.

---

## 📞 Need Help?

1. Check the relevant section above
2. See SETUP_GUIDE.md for more details
3. See QUICK_START.md for quick reference

---

**Ready? Pick an option and start playing!** 🎮🎉

---

**Last Updated:** Feb 2025
**Made with ❤️ for you and your friend**
