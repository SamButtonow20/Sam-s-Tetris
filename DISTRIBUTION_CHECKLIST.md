# 📦 Distribution Checklist

Use this checklist to prepare your Sam Stackerz game for sharing.

## ✅ Pre-Distribution Checks

### Web Version (Multiplayer Online)

- [ ] Test web version locally
```powershell
cd web
npm install
npm start
# Test at http://localhost:8080
```

- [ ] Both players can connect from browser
- [ ] Game creates properly when both join
- [ ] Game updates sync between players
- [ ] Room codes work correctly

### Desktop Version

- [ ] Test game runs locally
```powershell
python main.py
```

- [ ] All game controls work (arrows, space, rotation)
- [ ] Game starts and ends properly
- [ ] No errors in console

- [ ] Build executable successfully
```powershell
.\build.ps1
```

- [ ] Test the built .exe from dist/main/main.exe
- [ ] .exe runs without Python installed

## 📋 Files to Distribute

### Option 1: Web Version (Recommended)

Files to include in your GitHub repo:
- [ ] `web/` folder
- [ ] `web/server.js`
- [ ] `web/client.js`
- [ ] `web/index.html`
- [ ] `web/styles.css`
- [ ] `web/package.json`
- [ ] `.gitignore`
- [ ] `QUICK_START.md`
- [ ] `SETUP_GUIDE.md`
- [ ] `GETTING_STARTED.md`
- [ ] `DEPLOY_RAILWAY.md`

### Option 2: Desktop Executable

Files to share:
- [ ] `dist/main/` folder (entire folder, zipped)
- [ ] `README.md`
- [ ] Instructions for running `main.exe`

## 🚀 Deployment Checklist

### For Railway.app Deployment

- [ ] GitHub account created
- [ ] Tetris repository uploaded to GitHub
- [ ] Railway.app account created
- [ ] Project deployed successfully
- [ ] Public URL generated
- [ ] Tested from another device/network
- [ ] WebSocket connection works
- [ ] Both players can join same room
- [ ] Multiplayer game works end-to-end

### For Local Network

- [ ] Computer IP found (ipconfig)
- [ ] Firewall allows Node.js port 8080
- [ ] Friend can access http://YOUR_IP:8080
- [ ] Both on same WiFi network
- [ ] Room join syncing works

## 📝 Documentation to Share

Make sure to include these files:

- [ ] **QUICK_START.md** - Quick reference guide
- [ ] **GETTING_STARTED.md** - Detailed setup guide
- [ ] **SETUP_GUIDE.md** - All options explained
- [ ] **DEPLOY_RAILWAY.md** - If using Railway

## 🧪 Final Testing

### Multiplayer Testing
- [ ] Player 1 joins room "testroom"
- [ ] Player 2 joins same room "testroom"
- [ ] Both see "Waiting for opponent"
- [ ] Game starts automatically
- [ ] Both can move pieces
- [ ] Both see opponent pieces moving
- [ ] Game over triggers properly
- [ ] Can play multiple games in succession

### Different Environments
- [ ] Test on Windows
- [ ] Test on Mac (if applicable)
- [ ] Test on Linux (if applicable)
- [ ] Test on mobile browser (web version)

## 🔐 Security Check

- [ ] No passwords or credentials in code
- [ ] `.gitignore` prevents sensitive files
- [ ] No personal info exposed
- [ ] Game handles disconnects gracefully

## 📊 Performance Check

- [ ] Game is responsive (60 FPS target)
- [ ] No lag during gameplay
- [ ] Can handle 10+ concurrent games
- [ ] Low bandwidth usage

## 🎯 Distribution Method Checklist

### GitHub Distribution
- [ ] Repository is public (if desired)
- [ ] README is clear
- [ ] All documentation is included
- [ ] `.gitignore` is set up
- [ ] No unnecessary files committed

### Direct Share (Desktop)
- [ ] .exe file is for correct Windows version
- [ ] File size is reasonable
- [ ] Compressed properly for sharing
- [ ] Instructions are clear

### Railway.app Deployment
- [ ] Domain is user-friendly
- [ ] Can handle expected concurrent users
- [ ] Billing settings reviewed (stay free tier)
- [ ] Auto-deploy from main branch enabled

## ✨ Final Checklist

- [ ] You've tested everything works
- [ ] Documentation is complete and clear
- [ ] Friend can follow instructions easily
- [ ] Support mechanism in place (Discord, email, etc.)
- [ ] You're ready to share! 🎉

---

## 🆘 If Something Goes Wrong

1. Check the relevant troubleshooting section in GETTING_STARTED.md
2. Verify all files are in correct locations
3. Make sure all dependencies are installed
4. Try testing locally first before sharing
5. Check logs for error messages

---

## 📞 Support Preparation

Before you distribute, have these answers ready:

- How will your friend report issues?
- How quickly can you fix bugs?
- Will they test it end-to-end before release?
- Do they understand game controls?
- Have they tried multiplayer before?

---

Use this checklist before every distribution! ✅

**Last Updated:** Feb 2025
