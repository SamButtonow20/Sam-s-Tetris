import argparse
import json
import random
import socket
import threading
from dataclasses import dataclass, field


@dataclass
class ClientConn:
    sock: socket.socket
    addr: tuple
    room: str = "default"
    name: str = "player"
    index: int = -1
    opponent: "ClientConn | None" = None
    recv_buffer: bytes = b""
    alive: bool = True


@dataclass
class Room:
    code: str
    players: list[ClientConn] = field(default_factory=list)


rooms_lock = threading.Lock()
rooms: dict[str, Room] = {}


def send_json(sock: socket.socket, payload: dict):
    data = (json.dumps(payload) + "\n").encode("utf-8")
    sock.sendall(data)


def remove_client(client: ClientConn):
    client.alive = False
    try:
        client.sock.close()
    except Exception:
        pass

    opp = client.opponent
    if opp is not None:
        opp.opponent = None
        try:
            send_json(opp.sock, {"type": "opponent_left"})
        except Exception:
            remove_client(opp)

    with rooms_lock:
        room = rooms.get(client.room)
        if room is not None:
            room.players = [p for p in room.players if p is not client]
            if not room.players:
                rooms.pop(client.room, None)


def pair_room_if_ready(room: Room):
    if len(room.players) != 2:
        return
    p1, p2 = room.players
    p1.index = 0
    p2.index = 1
    p1.opponent = p2
    p2.opponent = p1
    seed = random.randrange(1_000_000)
    for player in (p1, p2):
        send_json(
            player.sock,
            {
                "type": "start",
                "seed": seed,
                "you": player.index,
                "opponent": player.opponent.name,
            },
        )


def handle_join(client: ClientConn, msg: dict):
    room_code = str(msg.get("room", "default")).strip() or "default"
    client.room = room_code
    client.name = str(msg.get("name", "player")).strip() or "player"

    with rooms_lock:
        room = rooms.get(room_code)
        if room is None:
            room = Room(code=room_code)
            rooms[room_code] = room

        if len(room.players) >= 2:
            send_json(client.sock, {"type": "error", "message": "Room is full"})
            remove_client(client)
            return

        room.players.append(client)
        send_json(client.sock, {"type": "joined", "room": room_code, "slot": len(room.players)})

        if len(room.players) == 1:
            send_json(client.sock, {"type": "waiting", "message": "Waiting for opponent"})
        pair_room_if_ready(room)


def relay_to_opponent(client: ClientConn, msg: dict):
    opp = client.opponent
    if opp is None:
        return
    try:
        send_json(opp.sock, msg)
    except Exception:
        remove_client(opp)


def process_message(client: ClientConn, msg: dict):
    mtype = msg.get("type")
    if mtype == "join":
        handle_join(client, msg)
        return

    if mtype in {"attack", "snapshot", "gameover", "ping"}:
        relay_to_opponent(client, msg)


def client_thread(client: ClientConn):
    try:
        while client.alive:
            chunk = client.sock.recv(4096)
            if not chunk:
                break
            client.recv_buffer += chunk
            while b"\n" in client.recv_buffer:
                line, client.recv_buffer = client.recv_buffer.split(b"\n", 1)
                line = line.strip()
                if not line:
                    continue
                try:
                    msg = json.loads(line.decode("utf-8"))
                except Exception:
                    continue
                process_message(client, msg)
    except Exception:
        pass
    finally:
        remove_client(client)


def serve(host: str, port: int):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(64)
    print(f"Sam Stackerz online server listening on {host}:{port}")

    try:
        while True:
            sock, addr = server.accept()
            sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
            client = ClientConn(sock=sock, addr=addr)
            t = threading.Thread(target=client_thread, args=(client,), daemon=True)
            t.start()
    finally:
        server.close()


def main():
    parser = argparse.ArgumentParser(description="Sam Stackerz online relay server")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    serve(args.host, args.port)


if __name__ == "__main__":
    main()
