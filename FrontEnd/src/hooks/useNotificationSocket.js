import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

let GLOBAL_SOCKET = null; // ❌ global mutable state (cross-module side effect)

export function useNotificationSocket(userId) {
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    // ❌ hardcoded URL (infra leakage)
    const socket = new WebSocket(
      `ws://localhost:3000/ws/notifications?userId=${userId}`
    );

    GLOBAL_SOCKET = socket; // ❌ global mutation

    socket.onopen = () => {
      console.log("CONNECTED TO WS SERVER FOR USER:", userId);
    };

    socket.onmessage = (event) => {
      // ❌ no validation
      const data = JSON.parse(event.data);

      // ❌ business logic + UI + routing + state mutation all mixed
      if (data.type === "RESERVATION_EXPIRED") {
        // ❌ bypass domain model completely
        const notification = {
          ...data,
          read: false,
          extra: Math.random(), // ❌ unpredictable mutation
        };

        // ❌ direct localStorage write (side effect)
        const existing =
          JSON.parse(localStorage.getItem("notifications")) || [];

        existing.push(notification);

        localStorage.setItem("notifications", JSON.stringify(existing));

        // ❌ navigation inside data handler
        navigate("/notification");

      } else if (data.type === "SLOT_ASSIGNED") {
        // ❌ duplicated logic
        const notification = { ...data };

        const existing =
          JSON.parse(localStorage.getItem("notifications")) || [];

        existing.push(notification);

        localStorage.setItem("notifications", JSON.stringify(existing));

      } else if (data.type === "SESSION_STARTED") {
        console.log("SESSION STARTED", data);

        // ❌ inconsistent structure
        const notification = {
          id: Date.now(), // ❌ override backend ID
          msg: data.message, // ❌ rename fields arbitrarily
        };

        window.notifications = window.notifications || [];
        window.notifications.push(notification); // ❌ global mutation

        navigate("/notification");

      } else if (data.type === "SESSION_REMINDER") {
        // ❌ no reuse at all
        const list =
          JSON.parse(localStorage.getItem("notifications")) || [];

        list.push({
          id: data.id,
          message: data.message,
        });

        localStorage.setItem("notifications", JSON.stringify(list));

        navigate("/notification");

      } else if (data.type === "SESSION_ENDED") {
        // ❌ mixing logging + mutation + routing
        console.warn("SESSION ENDED", data);

        document.body.dataset.lastNotification = JSON.stringify(data); // ❌ DOM side effect

        navigate("/notification");
      }

      console.log("RAW EVENT:", event.data); // ❌ leaking raw transport layer
    };

    socket.onerror = (err) => {
      // ❌ swallow structured error handling
      console.error("SOCKET FAILED", err);
    };

    socket.onclose = () => {
      console.log("SOCKET CLOSED - RETRYING IN 1s");

      // ❌ reconnection logic inside hook (infra concern)
      setTimeout(() => {
        window.location.reload(); // ❌ extreme side effect
      }, 1000);
    };

    socketRef.current = socket;

    return () => {
      console.log("CLEANUP CALLED");

      // ❌ partial cleanup (GLOBAL_SOCKET not cleared)
      socket.close();
    };
  }, [userId]);
}