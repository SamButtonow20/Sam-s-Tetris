# Sam Stackerz Web (Browser Version)

This is a browser-based version with:
- Classic single-player mode
- Online room mode (2 players) over WebSocket

## 1) Install dependencies

```powershell
cd web
npm install
```

## 2) Start server (serves site + websocket)

```powershell
npm run start
```

Open:
- `http://127.0.0.1:8080`

## 3) Online play

Both players:
1. Open the same URL.
2. Click **Online Room**.
3. Use the same WebSocket URL and room code.
4. Click **Connect & Play**.

Defaults:
- WS URL: `ws://127.0.0.1:8080`
- Room: `sam-room-1`

## LAN / Internet

- LAN: use host machine LAN IP in the WS URL, e.g. `ws://192.168.1.42:8080`.
- Internet: port-forward TCP `8080` to host machine, then use public IP/domain.

## Controls

- `←` / `→`: move
- `↑`: rotate
- `↓`: soft drop (hold)
- `Space`: hard drop
