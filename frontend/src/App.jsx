import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import io from "socket.io-client";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";

function GlobalSocketListener() {
  const [toast, setToast] = useState(null);
  const { user } = useAuth(); // Need user for individual notifications

  useEffect(() => {
    // Connect to the Socket.io server using env var, or fallback
    const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
    
    // Broadcast notifications
    newSocket.on("new_notification", (data) => {
      setToast(data);
      if (window.navigator?.vibrate) {
        window.navigator.vibrate([200, 100, 200]);
      }
      setTimeout(() => setToast(null), 8000);
    });

    // Individual notifications
    if (user?._id) {
      newSocket.on(`new_notification_${user._id}`, (data) => {
        setToast(data);
        if (window.navigator?.vibrate) {
          window.navigator.vibrate([200, 100, 200]);
        }
        setTimeout(() => setToast(null), 8000);
      });
    }

    // New Ride Request (for bubble)
    newSocket.on("new_ride_request", (data) => {
      // Store the timestamp of the new request to show bubble for 15 mins
      localStorage.setItem("last_ride_request_time", data.createdAt);
      // Force a custom event to update Navbar/BottomNav
      window.dispatchEvent(new Event("new_ride_request_arrived"));
    });

    return () => newSocket.close();
  }, [user]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-4 z-9999 w-[90%] md:w-auto min-w-[300px] bg-white border-l-4 border-primary p-4 rounded-xl shadow-2xl flex items-start gap-3 transition-all duration-300">
      <div className="text-primary text-2xl mt-1">
        <i className="ri-notification-3-fill"></i>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-800">{toast.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
      </div>
      <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
        <i className="ri-close-line text-lg"></i>
      </button>
    </div>
  );
}

// Pages
import Home from "./pages/Home";
import StudentRegister from "./pages/StudentRegister";
import StudentLogin from "./pages/StudentLogin";
import DriverLogin from "./pages/DriverLogin";
import AdminLogin from "./pages/AdminLogin";
import StudentDashboard from "./pages/StudentDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RideDetails from "./pages/RideDetails";
import DriverProfile from "./pages/DriverProfile";
import StudentProfile from "./pages/StudentProfile"; // NEW
import RideRequests from "./pages/RideRequests"; // NEW
import Complaints from "./pages/Complaints";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import DriverConsent from "./pages/DriverConsent";
import About from "./pages/About"; // NEW
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import AdminNotifications from "./pages/AdminNotifications";
import Minifooter from "./components/Minifooter";
import MoreLink from "./pages/MoreLink";

import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <GlobalSocketListener />
          <div className="min-h-screen flex flex-col pb-16 md:pb-0">
            <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/student-register" element={<StudentRegister />} />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/driver-login" element={<DriverLogin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/driver-consent" element={<DriverConsent />} />
              <Route path="/about" element={<About />} />
              <Route path="/more-links" element={<MoreLink />} />

              {/* Ride Details - Public */}
              <Route path="/ride/:id" element={<RideDetails />} />

              {/* Protected Student Routes */}
              <Route
                path="/student-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-profile"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Driver Routes */}
              <Route
                path="/driver-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["driver"]}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver-profile"
                element={
                  <ProtectedRoute allowedRoles={["driver"]}>
                    <DriverProfile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />

              {/* Protected - Any authenticated user */}
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute allowedRoles={["student", "driver"]}>
                    <Complaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ride-requests"
                element={
                  <ProtectedRoute allowedRoles={["student", "driver"]}>
                    <RideRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={["student", "driver"]}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {/* <Footer /> */}
          <Minifooter />
          <BottomNav />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
