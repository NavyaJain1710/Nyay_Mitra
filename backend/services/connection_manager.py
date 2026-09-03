"""WebSocket Connection Manager"""

from fastapi import WebSocket
from typing import Dict
import logging
import json

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"Connected: {session_id} | Total: {len(self.active_connections)}")

    def disconnect(self, session_id: str):
        self.active_connections.pop(session_id, None)
        logger.info(f"Disconnected: {session_id} | Total: {len(self.active_connections)}")

    async def send_to_session(self, session_id: str, data: dict):
        ws = self.active_connections.get(session_id)
        if ws:
            try:
                await ws.send_text(json.dumps(data))
            except Exception as e:
                logger.error(f"Failed to send to {session_id}: {e}")
                self.disconnect(session_id)

    async def broadcast(self, data: dict, exclude: str = None):
        for session_id, ws in list(self.active_connections.items()):
            if session_id != exclude:
                try:
                    await ws.send_text(json.dumps(data))
                except Exception:
                    self.disconnect(session_id)

    def get_active_sessions(self):
        return list(self.active_connections.keys())

    @property
    def total_connections(self):
        return len(self.active_connections)
