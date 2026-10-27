import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext.jsx";

export function useSocket(roomId) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !roomId) {
      setSocket(null);
      setMessages([]);
      return undefined;
    }

    const s = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
    });
    const onMessage = (message) => {
      setMessages((previous) => [...previous, message]);
    };

    setMessages([]);
    setSocket(s);
    s.on("chat:message", onMessage);
    s.emit("room:join", roomId);

    return () => {
      s.off("chat:message", onMessage);
      s.disconnect();
      setSocket((current) => (current === s ? null : current));
    };
  }, [token, roomId]);

  const sendMessage = useCallback(
    (text) => {
      const trimmedText = text.trim();
      if (trimmedText) {
        socket?.emit("chat:message", { roomId, text: trimmedText });
      }
    },
    [socket, roomId]
  );

  return { messages, sendMessage };
}
