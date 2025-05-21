import React, { useState, useEffect, useRef, useContext } from "react";
import { MessagesSquare, User, X, Send, Loader2 } from "lucide-react";
import { AuthContext } from "../../../AuthContext";
import Cookies from "js-cookie";
import { BASE_URL_WS, apiRequest } from "../../../utils/api";
import { message } from "antd";

const ChatRoom = (props) => {
  const { ticket_id, onClose } = props;
  const [loadingMessage, setLoadingMessage] = useState("Connecting ...");
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const { user } = useContext(AuthContext);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [pendingMessages, setPendingMessages] = useState([]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await apiRequest(
          "GET",
          `/api/chat/ticket/${ticket_id}/messages/`,
          null,
          true
        );
        if (response.status === 200) {
          setMessages(response.data);
        }
        if (response.status === 403) {
          setMessages([]);
          message.error("Unauthorized access to this ticket");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [ticket_id]);

  // WebSocket connection
  useEffect(() => {
    setLoadingMessage("Connecting ...");
    const accessToken = Cookies.get("accessToken");
    const ws = new WebSocket(
      `${BASE_URL_WS}/ws/chat/ticket/${ticket_id}/?token=${accessToken}`
    );
    socketRef.current = ws;

    ws.onopen = () => {
      setLoadingMessage("Connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        // Remove pending message if this is our own message being echoed back
        if (data.sender.id === user?.id) {
          setPendingMessages((prev) =>
            prev.filter((msg) => msg.content !== data.message)
          );
        }

        setMessages((prev) => [
          ...prev,
          {
            ticket: ticket_id,
            sender: data.sender,
            content: data.message,
            timestamp: data.timestamp,
          },
        ]);
      }
    };

    ws.onclose = () => {
      setLoadingMessage("Disconnected");
    };

    return () => {
      ws.close();
    };
  }, [ticket_id]);
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempTimestamp = new Date().toISOString();
    const pendingMessage = {
      ticket: ticket_id,
      sender: user,
      content: newMessage,
      timestamp: tempTimestamp,
      isPending: true,
    };

    setPendingMessages((prev) => [...prev, pendingMessage]);
    socketRef.current?.send(
      JSON.stringify({
        message: newMessage,
      })
    );
    scrollToBottom();
    setNewMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-scale-in flex flex-col"
        style={{ height: "80vh" }}
      >
        <div className="border-b border-slate-200 px-5 py-3 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white rounded-t-xl">
          <div className="">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              <MessagesSquare size={18} className="text-indigo-600 mr-2" />
              Ticket {ticket_id} Chat Room
            </h3>
            <div
              className={`text-sm ms-7 font-medium ${
                loadingMessage === "Connected"
                  ? "text-green-600"
                  : loadingMessage === "Connecting ..."
                  ? "text-blue-600"
                  : loadingMessage === "Loading Messages ..."
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {loadingMessage}
            </div>
          </div>
          <button
            className="text-slate-400 hover:text-slate-600 transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>{" "}
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[...messages, ...pendingMessages]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender.id === user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] min-w-[200px] rounded-lg px-3 py-1 ${
                    message.sender.id === user?.id
                      ? "bg-indigo-600 text-white ml-4"
                      : "bg-gray-100 text-gray-800 mr-4"
                  }`}
                >
                  {message.sender.id !== user?.id && (
                    <div className="text-sm font-small text-orange-500">
                      {message.sender.name}
                      <hr />
                    </div>
                  )}
                  <div className="text-sm">{message.content}</div>
                  <div
                    className={`text-xs mt-1 flex justify-between items-center ${
                      message.sender.id === user?.id
                        ? "text-indigo-200"
                        : "text-gray-500"
                    }`}
                  >
                    <span>
                      {new Date(message.timestamp).toDateString()} -{" "}
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.isPending && (
                      <span className="ml-2 animate-pulse">Sending...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          {isLoadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm text-gray-500">Loading messages...</p>
              </div>
            </div>
          ) : null}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Area */}
        <form
          onSubmit={sendMessage}
          className="border-t border-gray-200 p-4 bg-white rounded-b-xl"
        >
          <div className="flex items-center space-x-2">
            <input
              disabled={loadingMessage !== "Connected" || isLoadingMessages}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                loadingMessage !== "Connected"
                  ? "Waiting for connection..."
                  : "Type your message..."
              }
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors flex items-center"
              disabled={!newMessage.trim() || loadingMessage !== "Connected" || isLoadingMessages}
              style={
                loadingMessage !== "Connected" || !newMessage.trim() || isLoadingMessages
                  ? {
                      background: "gray",
                      ...(loadingMessage !== "Connected"
                        ? { cursor: "not-allowed" }
                        : {}),
                    }
                  : {}
              }
            >
              <Send size={18} className="mr-1" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
