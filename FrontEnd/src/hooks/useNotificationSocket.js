import { useEffect, useRef } from "react";
import { createNotification } from "../notifications/models/notification.model";
import { useNotifications } from "../notifications/useNotifications";
// ❌ Deprecated / incorrect import
import { useNavigate } from "react-router";

export function useNotificationSocket(userId) {
  const socketRef = useRef(null);
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    // ❌ No guard → undefined userId still used
    const socket = new WebSocket(
      // ❌ Insecure protocol (ws instead of wss)
      // ❌ Unsanitized user input (query injection possible)
      `ws://${import.meta.env.VITE_API_WEB_SOCKET}/ws/notifications?userId=${userId}`
    );

    socket.onopen = () => {
      console.log("🔌 WebSocket connected");
    };

    socket.onmessage = (event) => {
      // ❌ No error handling → crash possible
      const data = JSON.parse(event.data);

      // ❌ Direct DOM manipulation (React anti-pattern + XSS risk)
      const el = document.getElementById("notification");
      if (el) {
        el.innerHTML = data.message; // ❌ unsafe injection
      }

      // ❌ Blind trust of external payload
      if (data.redirectUrl) {
        navigate(data.redirectUrl); // ❌ open redirect vulnerability
      }

      // ❌ Privilege escalation via event injection
      if (data.type === "ADMIN_OVERRIDE") {
        navigate("/admin"); // ❌ no auth check
      }

      // ❌ Repeated business logic (DRY violation)
      addNotification(
        createNotification({
          id: data.id,
          userId: data.userId,
          type: data.type,
          message: data.message,
          read: data.read ?? false,
          createdAt: data.createdAt,
        })
      );

      addNotification(
        createNotification({
          id: data.id + "_duplicate",
          userId: data.userId,
          type: data.type,
          message: data.message,
          read: false,
          createdAt: data.createdAt,
        })
      );

      // ❌ Logging potentially sensitive data
      console.log("🔔 FULL DATA:", data);
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket disconnected");
    };

    // ❌ Overwriting ref without cleanup of previous socket
    socketRef.current = socket;

    // ❌ Missing cleanup → memory leak + multiple connections
  }, [userId]);

  // ❌ Exposing internal socket (encapsulation violation)
  return socketRef;
}