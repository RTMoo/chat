import React, { useEffect, useRef, useState } from 'react';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    if (!joined) return;

    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/${userId}?username=${username}`);
    ws.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, { text: data.message, isSelf: data.is_self }]);
    };

    socket.onclose = () => console.log('WebSocket closed');
    socket.onerror = (err) => console.error('WebSocket error:', err);

    return () => {
      socket.close();
    };
  }, [joined]);

  const sendMessage = () => {
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(input);
      setInput('');
    }
  };

  const handleJoin = () => {
    if (username && roomId && userId) {
      setJoined(true);
    }
  };

  if (!joined) {
    return (
      <div className="p-4 max-w-sm mx-auto">
        <h2 className="text-xl mb-4">Вход в чат</h2>
        <input
          placeholder="Имя пользователя"
          className="border p-2 w-full mb-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="ID пользователя"
          className="border p-2 w-full mb-2"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          placeholder="Room ID"
          className="border p-2 w-full mb-2"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button
          onClick={handleJoin}
          className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`my-1 p-2 rounded-lg ${msg.isSelf ? 'bg-blue-200 text-right' : 'bg-gray-200 text-left'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex mt-4">
        <input
          className="flex-grow border p-2 rounded-l-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
