import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { format } from "date-fns";
import API from "../api";

const ChatModal = ({ rideId, onClose, currentUserRole, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      try {
        const endpoint =
          currentUserRole === "driver"
            ? `/driver/rides/${rideId}/messages`
            : `/student/ride/${rideId}/messages`;

        const { data } = await API.get(endpoint);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // 2. Connect to Socket.IO and join room
    // Use the backend URL from env or fallback
    const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    socketRef.current = io(SOCKET_URL);

    // Join the specific ride's chat room
    socketRef.current.emit("joinRide", rideId);

    // Listen for new messages broadcasted by the server
    socketRef.current.on("newMessage", (msg) => {
      setMessages((prev) => {
        // Prevent duplicate messages if we just sent it
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socketRef.current.emit("leaveRide", rideId);
      socketRef.current.disconnect();
    };
  }, [rideId, currentUserRole]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const endpoint =
        currentUserRole === "driver"
          ? `/driver/rides/${rideId}/messages`
          : `/student/ride/${rideId}/messages`;

      const { data } = await API.post(endpoint, { text: newMessage });

      // Add immediately for snappy UI (Socket will also broadcast, but we handle dupes)
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-white backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-gray-50 w-full sm:max-w-md h-[82vh] sm:h-[500px] rounded-t-2xl sm:rounded-2xl  flex flex-col overflow-hidden transform transition-all animate-slide-up sm:animate-fade-in relative mb-20 ">
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b flex justify-between items-center shrink-0 shadow-sm z-10  ">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center font-bold text-lg">
              <i className="ri-chat-3-line"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">
                Ride Chat
              </h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success"></span>{" "}
                Real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors border-none cursor-pointer"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              <i className="ri-loader-4-line animate-spin text-2xl mr-2"></i>{" "}
              Loading chat...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 text-3xl mb-3 shadow-sm shadow-black/5">
                <i className="ri-message-3-line"></i>
              </div>
              <p className="text-gray-500 font-medium font-[var(--font-heading)]">
                No messages yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Start the conversation with your driver or passengers.
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              {messages.map((msg, index) => {
                const isMe =
                  msg.sender_id?._id === currentUserId ||
                  msg.sender_id === currentUserId;
                const senderName = msg.sender_id?.name || "Unknown";
                const isDriver = msg.sender_model === "Driver";

                // Show timestamp logic (only show if it's the first message or >5 mins since last)
                const msgTime = new Date(msg.createdAt);
                let showTimestamp = false;
                if (index === 0) {
                  showTimestamp = true;
                } else {
                  const prevTime = new Date(messages[index - 1].createdAt);
                  if (msgTime - prevTime > 5 * 60 * 1000) showTimestamp = true;
                }

                return (
                  <div key={msg._id} className="flex flex-col">
                    {showTimestamp && (
                      <div className="text-center my-3">
                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-200/50 px-2 py-1 rounded-full">
                          {format(msgTime, "MMM d, h:mm a")}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"} mb-1`}
                    >
                      {!isMe && (
                        <span className="text-[10px] text-gray-500 mb-1 ml-1 flex items-center gap-1 font-medium">
                          {isDriver && (
                            <i className="ri-steering-2-line text-primary"></i>
                          )}
                          {senderName}{" "}
                          {isDriver && (
                            <span className="bg-primary/20 text-primary-dark px-1.5 rounded text-[8px] uppercase tracking-wider">
                              Driver
                            </span>
                          )}
                        </span>
                      )}

                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isMe
                            ? "bg-primary text-gray-900 rounded-tr-sm font-medium"
                            : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>

                      <span
                        className={`text-[9px] text-gray-400 mt-1 ${isMe ? "mr-1" : "ml-1"}`}
                      >
                        {format(msgTime, "h:mm a")}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="bg-white p-3 border-t shrink-0 mb-safe z-10">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-1 border border-transparent focus-within:border-primary focus-within:bg-white transition-colors relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message..."
                className="w-full bg-transparent border-none outline-none py-2 text-sm placeholder-gray-400"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-transform hover:scale-105 active:scale-95 border-none shadow-sm shadow-primary/30"
            >
              <i className="ri-send-plane-fill relative left-0.5"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
