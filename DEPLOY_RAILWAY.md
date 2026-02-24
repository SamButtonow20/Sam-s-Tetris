# Deploy to Railway.app (Free & Easy!)

Railway.app is the simplest way to host your multiplayer Tetris game for your friend.

## Step-by-Step Instructions

### 1. Prepare Your GitHub Repository

First, push your Tetris project to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Tetris game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tetris.git
git push -u origin main
```

### 2. Sign Up for Railway.app

1. Go to https://railway.app
2. Click "Start a Project"
3. Sign up or log in with GitHub (recommended)

### 3. Create New Project from GitHub

1. Click "Create a new project"
2. Select "Deploy from GitHub repo"
3. Select your `tetris` repository
4. Railway will automatically detect the Node.js project in the `web` folder

### 4. Configure the Deployment

1. In the Railway dashboard, select your project
2. Click on the service that's been created
3. Go to "Variables" tab
4. Add environment variables:
   - `PORT`: `8080` (usually detected automatically)
   - `HOST`: `0.0.0.0`

### 5. Deploy

Click the "Deploy" button. Railway will:
1. Install dependencies (`npm install`)
2. Build the project
3. Start the server

### 6. Get Your URL

1. Once deployed, go to the "Settings" tab
2. Look for "Domains"
3. Railway will provide you a public URL like `https://tetris-production-xxxxx.railway.app`

### 7. Share with Your Friend

Send your friend the URL and they can:
1. Open the URL in their browser
2. Enter their name
3. Enter a room code (can be anything, e.g., "room1")
4. Wait for you to join the same room
5. Start playing!

## Troubleshooting

### Port Already in Use
Railway writes this to the `PORT` environment variable. Make sure `server.js` uses:
```javascript
const PORT = Number(process.env.PORT || process.argv[2] || 8080);
```

### Service not starting
Check the "Logs" tab in Railway dashboard for error messages.

### Connection Issues from Browser
Make sure firewall/antivirus allows WebSocket connections.

## Other Free Hosting Options

If Railway doesn't work for you:

### **Render.com**
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`

### **Replit**
1. Go to https://replit.com
2. Create new project
3. Select Node.js
4. Upload your `web` folder
5. Click Run

### **Heroku** (Still works but less free tier)
1. Create account at https://heroku.com
2. Install Heroku CLI
3. Run: `heroku create && git push heroku main`

## Custom Domain (Optional)

Most platforms let you add a custom domain. This is optional but makes sharing easier!

---

**Ready to deploy?** Follow the steps above and share the URL with your friend! 🎮
