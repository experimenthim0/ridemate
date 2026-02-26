import { useState, useEffect, useRef } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext"; // Import useAuth to get the role

const EMOJI_LIST = ["😊", "👍", "🙏", "🛺", "⏰", "📍", "✅", "🚗", "👋", "😅"];

const RideChat = ({ rideId, currentUserId, canChat }) => {
  const { role } = useAuth(); // Get the user's role to determine the correct route
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Determine the correct API prefix based on role
  const routePrefix = role === "driver" ? "/driver/rides" : "/student/ride";

  const fetchMessages = async () => {
    try {
      // Changed from /rides/${rideId}/chat to the correct messages endpoint
      const { data } = await API.get(`${routePrefix}/${rideId}/messages`);
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!canChat) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [rideId, canChat, role]);



  const handleSend = async () => {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (/https?:\/\//i.test(trimmed)) {
    alert("Links are not allowed in chat.");
    return;
  }

  setLoading(true);
  try {
    await API.post(`${routePrefix}/${rideId}/messages`, { text: trimmed });
    setText("");
    setShowEmoji(false);
    await fetchMessages();

    // ✅ Scroll only when sending
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    alert(err.response?.data?.message || "Failed to send");
  }
  setLoading(false);
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!canChat) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400 text-sm border border-gray-200">
        <i className="ri-lock-line text-2xl mb-2 block"></i>
        Chat is only available to booked riders and the ride creator.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <i className="ri-chat-3-fill text-primary text-lg"></i>
        <span className="font-bold text-sm text-gray-800">Ride Chat</span>
        <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
          <i className="ri-time-line"></i> Messages expire in 3h
        </span>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-xs mt-10">
            No messages yet. Say hi! 👋
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id?._id === currentUserId;
          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
            >
              {!isMine && (
                <span className="text-xs text-gray-400 mb-0.5 ml-1">
                  {msg.sender_id?.name || "Rider"}
                </span>
              )}
              <div
                className={`px-3 py-2 rounded-2xl text-sm max-w-[75%] break-words ${
                  isMine
                    ? "bg-gray-200 text-auto-black rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {/* Changed from msg.message to msg.text based on your backend */}
                {msg.text} 
              </div>
              <span className="text-xs text-gray-300 mt-0.5">
                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }) : ""}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="px-4 py-2 border-t border-gray-100 flex flex-wrap gap-1.5">
          {EMOJI_LIST.map((e) => (
            <button
              key={e}
              onClick={() => setText((t) => t + e)}
              className="text-xl bg-transparent border-none cursor-pointer hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className={`text-xl border-none bg-transparent cursor-pointer transition-colors ${
            showEmoji ? "text-primary" : "text-gray-400 hover:text-gray-600"
          }`}
          title="Emoji"
        >
          <i className="ri-emoji-sticker-line"></i>
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={300}
          placeholder="Type a message... (text & emojis only)"
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary bg-gray-50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !text.trim()}
          className="bg-primary hover:bg-primary-dark text-auto-black px-4 py-2 rounded-xl font-bold text-sm border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i className="ri-send-plane-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default RideChat;