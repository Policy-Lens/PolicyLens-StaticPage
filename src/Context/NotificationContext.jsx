import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { BASE_URL_WS } from "../utils/api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 5000; // 5 seconds

  // Function to connect to WebSocket
  const connectWebSocket = useCallback(() => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      console.log("No access token available");
      return;
    }

    // Don't attempt to reconnect if we've exceeded max attempts
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log("Max reconnection attempts reached");
      return;
    }

    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection if any
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("Closing existing connection");
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(
        `${BASE_URL_WS}/ws/notifications/?token=${accessToken}`
      );

      ws.onopen = () => {
        console.log("Notification WebSocket Connected");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "notification":
              handleNewNotification(data.data);
              break;
            case "notification_count":
              // Update unread count from server
              setUnreadCount(data.count);
              break;
            default:
              console.log("Unknown message type:", data.type);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("Notification WebSocket Error:", error);
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log(
          "Notification WebSocket Disconnected",
          event.code,
          event.reason
        );
        setIsConnected(false);

        // Only attempt to reconnect if the connection was closed unexpectedly
        // and we haven't exceeded max attempts
        if (
          event.code !== 1000 &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
        ) {
          reconnectAttemptsRef.current += 1;
          console.log(
            `Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`
          );
          reconnectTimeoutRef.current = setTimeout(
            connectWebSocket,
            RECONNECT_DELAY
          );
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setIsConnected(false);
    }
  }, []);

  // Handle new notification
  const handleNewNotification = useCallback((notificationData) => {
    const newNotification = {
      id: Date.now(),
      ...notificationData,
    };

    setNotifications((prev) => {
      // Keep only the last 5 notifications
      const updatedNotifications = [...prev, newNotification].slice(-5);
      return updatedNotifications;
    });

    // Only increment unread count if we haven't received a notification_count update
    // This prevents double counting when both notification and count updates arrive
    setUnreadCount((prev) => {
      // If the count is already higher than our local count, use the higher value
      // This ensures we don't lose count updates from the server
      return Math.max(prev + 1, prev);
    });

    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== newNotification.id)
      );
    }, 5000);
  }, []);

  // Mark notifications as read
  const markNotificationsAsRead = useCallback(() => {
    setUnreadCount(0);
    // Optionally, you could send a message to the server to mark notifications as read
    // if (wsRef.current?.readyState === WebSocket.OPEN) {
    //   wsRef.current.send(JSON.stringify({ type: "mark_read" }));
    // }
  }, []);

  // Remove a specific notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // Connect WebSocket when component mounts
  useEffect(() => {
    connectWebSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
        wsRef.current = null;
      }
      reconnectAttemptsRef.current = 0;
    };
  }, [connectWebSocket]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markNotificationsAsRead,
        removeNotification,
        isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
