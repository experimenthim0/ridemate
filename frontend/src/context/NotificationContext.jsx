import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import io from "socket.io-client";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showRideRequestBubble, setShowRideRequestBubble] = useState(false);
  const { user } = useAuth();

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const unread = data.filter(n => {
          if (n.type === 'individual') return !n.isRead;
          return !n.readBy?.includes(user._id);
      }).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching unread count", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();

      const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

      const handleNewNotification = () => {
        setUnreadCount(prev => prev + 1);
      };

      socket.on("new_notification", handleNewNotification);
      socket.on(`new_notification_${user._id}`, handleNewNotification);

      socket.on("new_ride_request", (data) => {
          localStorage.setItem("last_ride_request_time", data.createdAt);
          checkRideRequestBubble();
      });

      return () => socket.close();
    } else {
        setUnreadCount(0);
    }
  }, [user]);

  const checkRideRequestBubble = () => {
    const lastTime = localStorage.getItem("last_ride_request_time");
    if (lastTime) {
      const diff = Date.now() - new Date(lastTime).getTime();
      const fifteenMinutes = 15 * 60 * 1000;
      setShowRideRequestBubble(diff < fifteenMinutes);
    } else {
      setShowRideRequestBubble(false);
    }
  };

  useEffect(() => {
    checkRideRequestBubble();
    const interval = setInterval(checkRideRequestBubble, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, showRideRequestBubble, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
