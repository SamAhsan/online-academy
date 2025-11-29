"""
WebSocket Signaling Server for WebRTC Video Calls
This server handles WebRTC signaling between teachers and students
"""
import asyncio
import json
import logging
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Store active connections: {client_id: websocket}
active_connections: Dict[str, WebSocket] = {}
# Store active rooms/lessons: {lesson_id: {student_id, teacher_id}}
active_rooms: Dict[int, Set[str]] = {}


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"✅ Client connected: {client_id}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"👋 Client disconnected: {client_id}")

    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")

    async def broadcast(self, message: dict, exclude_client: str = None):
        for client_id, connection in self.active_connections.items():
            if client_id != exclude_client:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {client_id}: {e}")

    def get_other_clients(self, exclude_client: str = None):
        return [cid for cid in self.active_connections.keys() if cid != exclude_client]


manager = ConnectionManager()


@router.websocket("/ws/signaling")
async def websocket_endpoint(websocket: WebSocket):
    client_id = None
    try:
        await websocket.accept()
        logger.info("👤 New WebSocket connection")

        while True:
            # Receive message
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "register":
                # Client registration
                client_id = data.get("clientId")
                manager.active_connections[client_id] = websocket
                logger.info(f"✅ Client registered: {client_id}")

                # Send list of other clients
                other_clients = manager.get_other_clients(client_id)
                await websocket.send_json({
                    "type": "clients",
                    "clients": other_clients
                })

                # Notify other clients about new user
                await manager.broadcast({
                    "type": "user-joined",
                    "clientId": client_id
                }, exclude_client=client_id)

            elif message_type in ["offer", "answer", "ice-candidate"]:
                # Forward signaling messages
                target = data.get("target")
                if target and target in manager.active_connections:
                    data["from"] = client_id
                    await manager.send_personal_message(data, target)
                else:
                    logger.warning(f"Target {target} not found")

            else:
                logger.warning(f"Unknown message type: {message_type}")

    except WebSocketDisconnect:
        logger.info(f"Client disconnected: {client_id}")
        if client_id:
            manager.disconnect(client_id)
            # Notify others
            await manager.broadcast({
                "type": "user-left",
                "clientId": client_id
            })
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if client_id:
            manager.disconnect(client_id)
