import React, { useState, useEffect, useCallback } from "react";
import { useNotifications } from "../../Context/NotificationContext";
import { apiRequest, BASE_URL_WS } from "../../utils/api";
import { formatToDateTime, formatToDate } from "../../utils/helperFunctions";
import {
  Trash2,
  MessageSquare,
  ExternalLink,
  ArrowRight,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import ChatRoom from "../AdminView/ProjectTabs/ChatRoom";

const MessagingPage = () => {
  const [notifications, setNotifications] = useState({ new: [], old: [] });
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { markNotificationsAsRead } = useNotifications();
  const wsRef = React.useRef(null);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiRequest(
        "GET",
        "/api/chat/notifications/",
        null,
        true
      );
      if (response.status === 200) {
        setNotifications(response.data);
        markAsRead();
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback(async () => {
    try {
      await apiRequest(
        "PATCH",
        "/api/chat/notifications/mark_read/",
        null,
        true
      );
      // Don't move notifications to old, just mark them as read
      markNotificationsAsRead();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }, [markNotificationsAsRead]);

  // Delete notifications
  const deleteNotifications = useCallback(async (ids = []) => {
    try {
      await apiRequest(
        "DELETE",
        "/api/chat/notifications/bulk_delete/",
        ids.length > 0 ? { ids } : {},
        true
      );
      // Update local state
      if (ids.length === 0) {
        setNotifications({ new: [], old: [] });
      } else {
        setNotifications((prev) => ({
          new: prev.new.filter((n) => !ids.includes(n.id)),
          old: prev.old.filter((n) => !ids.includes(n.id)),
        }));
      }
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  }, []);

  // Handle notification selection
  const toggleNotificationSelection = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (
      selectedNotifications.length ===
      notifications.new.length + notifications.old.length
    ) {
      setSelectedNotifications([]);
    } else {
      const allIds = [...notifications.new, ...notifications.old].map(
        (n) => n.id
      );
      setSelectedNotifications(allIds);
    }
  };

  // Handle new notification from WebSocket
  const handleNewNotification = useCallback(
    (notification) => {
      setNotifications((prev) => ({
        new: [notification, ...prev.new],
        old: prev.old,
      }));
      // Don't increment counter if we're on the messages page
      markAsRead();
      markNotificationsAsRead();
    },
    [markNotificationsAsRead]
  );

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) return;

    const ws = new WebSocket(
      `${BASE_URL_WS}/ws/notifications/?token=${accessToken}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected for messages page");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification") {
          handleNewNotification(data.data);
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected, attempting to reconnect...");
      setTimeout(initializeWebSocket, 5000); // Reconnect after 5 seconds
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [handleNewNotification]);

  // Initial setup
  useEffect(() => {
    fetchNotifications();
    const cleanup = initializeWebSocket();

    return () => {
      if (cleanup) cleanup();
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [fetchNotifications, markAsRead, initializeWebSocket]);

  const handleNotificationClick = (notification) => {
    setSelectedTicket(notification.ticket.id);
  };

  const handleProjectClick = (e, projectId) => {
    e.stopPropagation();
    navigate(`/project/${projectId}`);
  };

  const closeChatModal = () => {
    setSelectedTicket(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-slate-200">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <div className="flex gap-2">
          {selectedNotifications.length > 0 && (
            <button
              onClick={() => deleteNotifications(selectedNotifications)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          )}
          <button
            onClick={() => deleteNotifications()}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} />
            Delete All
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-lg shadow">
        {/* Select all checkbox */}
        <div className="p-4 border-b">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={
                selectedNotifications.length ===
                notifications.new.length + notifications.old.length
              }
              onChange={toggleSelectAll}
              className="rounded border-gray-300"
            />
            <span>Select All</span>
          </label>
        </div>

        {/* New notifications */}
        {notifications.new.length > 0 && (
          <>
            <div className="p-4 bg-blue-50">
              <h2 className="font-semibold text-blue-700">New Messages</h2>
            </div>
            {notifications.new.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isSelected={selectedNotifications.includes(notification.id)}
                onSelect={() => toggleNotificationSelection(notification.id)}
                isNew={true}
                onNotificationClick={handleNotificationClick}
                onProjectClick={handleProjectClick}
              />
            ))}
          </>
        )}

        {/* Divider */}
        {notifications.new.length > 0 && notifications.old.length > 0 && (
          <div className="border-t bg-slate-200 border-gray-200 py-4"></div>
        )}

        {/* Old notifications */}
        {notifications.old.length > 0 && (
          <>
            <div className="p-4 bg-gray-50">
              <h2 className="font-semibold text-gray-700">Previous Messages</h2>
            </div>
            {notifications.old.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isSelected={selectedNotifications.includes(notification.id)}
                onSelect={() => toggleNotificationSelection(notification.id)}
                isNew={false}
                onNotificationClick={handleNotificationClick}
                onProjectClick={handleProjectClick}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {notifications.new.length === 0 && notifications.old.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-600">
              No messages to display
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Your messages will appear here
            </p>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedTicket && (
        <ChatRoom ticket_id={selectedTicket} onClose={closeChatModal} />
      )}
    </div>
  );
};

const NotificationItem = ({
  notification,
  isSelected,
  onSelect,
  isNew,
  onNotificationClick,
  onProjectClick,
}) => {
  const { message, project, ticket, created_at } = notification;

  return (
    <div
      className={`p-4 border-b last:border-b-0 ${
        isNew ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-gray-100"
      } transition-colors cursor-pointer`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="mt-1 rounded border-gray-300"
        />
        <div className="flex-1">
          {/* Project name with navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={(e) => onProjectClick(e, project.id)}
              className="flex items-center gap-2 text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors group"
            >
              {project.name}
              <ExternalLink
                size={16}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <span className="text-sm text-gray-500">
              {formatToDateTime(created_at)}
            </span>
          </div>

          {/* Ticket info with chat navigation */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">
                Ticket #{ticket.id}: {ticket.subject}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNotificationClick(notification);
                }}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ArrowRight size={14} />
                Open Chat
              </button>
            </div>
          </div>

          {/* Message content with sender info */}
          <div
            className={`mt-2 p-3 rounded-lg ${
              isNew ? "bg-blue-50" : "bg-gray-100"
            }`}
          >
            <p
              className={`text-sm ${
                isNew ? "text-gray-800" : "text-gray-600"
              } mb-2`}
            >
              {message.content}
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-500 pt-2 border-t border-gray-200">
              <User size={14} />
              <span>{message.sender.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
