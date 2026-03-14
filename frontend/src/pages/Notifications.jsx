import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

    socket.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    socket.on(`new_notification_${user?._id}`, (notification) => {
        setNotifications((prev) => [notification, ...prev]);
    });

    return () => socket.close();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications((prev) =>
        prev.map((n) => {
          if (n._id === id) {
            if (n.type === 'individual') return { ...n, isRead: true };
            return { ...n, readBy: [...(n.readBy || []), user._id] };
          }
          return n;
        })
      );
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const isNotificationRead = (notification) => {
    if (notification.type === 'individual') return notification.isRead;
    return notification.readBy?.includes(user?._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-200 transition-all"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          </div>
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {notifications.filter(n => !isNotificationRead(n)).length} Unread
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <i className="ri-notification-off-line text-3xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">No Notifications</h3>
            <p className="text-gray-500 mt-2">You're all caught up! When you get new notifications, they'll show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => !isNotificationRead(notification) && markAsRead(notification._id)}
                className={`relative overflow-hidden bg-white p-5 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-pointer group ${
                  !isNotificationRead(notification) ? "border-l-4 border-l-primary" : "opacity-80"
                }`}
              >
                {!isNotificationRead(notification) && (
                  <div className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                )}
                
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    notification.type === 'broadcast' ? 'bg-blue-50 text-blue-500' : 
                    notification.type === 'individual' ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-500'
                  }`}>
                    <i className={`${
                      notification.type === 'broadcast' ? 'ri-megaphone-line' : 
                      notification.type === 'individual' ? 'ri-user-voice-line' : 'ri-notification-3-line'
                    } text-2xl`}></i>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold text-gray-800 ${!isNotificationRead(notification) ? '' : 'font-semibold'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                        {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    {notification.type === 'broadcast' && (
                        <div className="mt-3 flex items-center gap-1.5">
                            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Broadcast</span>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
