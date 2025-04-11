import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
from fastapi import Query

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/ws/chat")


class ConnectionManager:
    def __init__(self):
        # {room_id: {user_id: WebSocket}}
        self.active_connections: Dict[int, Dict[int, WebSocket]] = {}

    async def connection(
        self, websocket: WebSocket, room_id: int, user_id: int
    ):
        """
        Устанавливает соединение с пользователем.
        websocket.accept() — подтверждает подключение.
        """
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][user_id] = websocket

    def disconnect(self, room_id: int, user_id: int):
        """
        Закрывает соединение и удаляет его из списка активных подключений.
        Если в комнате больше нет пользователей, удаляет комнату.
        """
        if (
            room_id in self.active_connections and
            user_id in self.active_connections[room_id]
        ):
            del self.active_connections[room_id][user_id]

            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, message: str, room_id: int, sender_id: int):
        if room_id in self.active_connections:
            for user_id, connection in self.active_connections[room_id].items():
                data = {
                    "message": message,
                    "is_self": user_id == sender_id,
                }

                await connection.send_json(data)


manager = ConnectionManager()


@router.websocket("/{room_id}/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, room_id: int, user_id: int, username: str=Query(...)
):
    await manager.connection(
        websocket=websocket, room_id=room_id, user_id=user_id
    )
    message = f"{username} (ID: {user_id}) присоеденился к чату"
    await manager.broadcast(message=message, room_id=room_id, sender_id=user_id)

    try:
        while True:
            data = await websocket.receive_text()
            message = f"{username} (ID: {user_id}) {data}"
            await manager.broadcast(
                message=message, room_id=room_id, sender_id=user_id)
    except WebSocketDisconnect:
        manager.disconnect(room_id=room_id, user_id=user_id)
        message = f"{username} (ID: {user_id}) покинул чат."
        await manager.broadcast(message=message, room_id=room_id, sender_id=user_id)
