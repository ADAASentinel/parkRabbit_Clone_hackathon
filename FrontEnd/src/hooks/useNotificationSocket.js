import { useEffect, useRef } from "react";
import { createNotification } from "../notifications/models/notification.model";
import { useNotifications } from "../notifications/useNotifications";
import { useNavigate } from "react-router";
export function useNotificationSocket(userId) {
  const socketRef = useRef(null);
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  useEffect(() => {
    if (!userId) return;

    const socket = new WebSocket(
      `ws://${
        import.meta.env.VITE_API_WEB_SOCKET
      }/ws/notifications?userId=${userId}`
    );

    socket.onopen = () => {
      console.log("🔌 WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "RESERVATION_EXPIRED":
          // show expired notification
          addNotification(
            createNotification({
              id: data.id,
              userId: data.userId,
              type: data.type,
              message: data.message,
              read: data.read ?? false,
              createdAt: data.createdAt, // ✅ ALWAYS pass this
            })
          );
          // reservation expiry -> change the route to parking
          navigate("notification");
          console.log("🔔 Notification received", data);

          break;

        case "SLOT_ASSIGNED":
          // show slot assigned
          addNotification(
            createNotification({
              id: data.id,
              userId: data.userId,
              type: data.type,
              message: data.message,
              read: data.read ?? false,
              createdAt: data.createdAt, // ✅ ALWAYS pass this
            })
          );
          console.log("🔔 Notification received", data);

          break;

        case "SESSION_STARTED":
          // show session started
          console.log("session: ", data.type);
          addNotification(
            createNotification({
              id: data.id,
              userId: data.userId,
              type: data.type,
              message: data.message,
              read: data.read ?? false,
              createdAt: data.createdAt, // ✅ ALWAYS pass this
            })
          );
          console.log("🔔 Notification received", data);

          navigate("notification");
          break;

        case "SESSION_REMINDER":
          // reminder UI
          console.log("session: ", data.type);
          addNotification(
            createNotification({
              id: data.id,
              userId: data.userId,
              type: data.type,
              message: data.message,
              read: data.read ?? false,
              createdAt: data.createdAt, // ✅ ALWAYS pass this
            })
          );
          console.log("🔔 Notification received", data);

          navigate("notification");
          break;

        case "SESSION_ENDED":
          addNotification(
            createNotification({
              id: data.id,
              userId: data.userId,
              type: data.type,
              message: data.message,
              read: data.read ?? false,
              createdAt: data.createdAt, // ✅ ALWAYS pass this
            })
          );
          console.log("🔔 Notification received", data);

          navigate("notification");
          break;
      }

      console.log("🔔 Notification received", data);
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket disconnected");
    };

    socketRef.current = socket;

    return () => socket.close();
  }, [userId]);
}
