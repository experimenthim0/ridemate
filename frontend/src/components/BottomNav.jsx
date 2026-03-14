import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const BottomNav = () => {
  const { user, role } = useAuth();
  const location = useLocation();
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Feature detection for touch devices
    setIsTouchDevice(navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Return early if it's not a touch device or if we're on admin dashboard (admins probably use desktop)
  if (!isTouchDevice || role === "admin") return null;

  return (
    <div className="md:hidden rounded-full fixed bottom-0 left-10 right-10 
bg-white/30 backdrop-blur-lg 
border border-gray-400
flex justify-around items-center 
py-1 px-1 z-50 pb-safe mb-2.5">
      {!user ? (
        <>
          <Link
            to="/"
            className={`flex flex-col items-center p-2 rounded-lg ${
              location.pathname === "/" ? "text-green-500" : "text-gray-800 hover:text-gray-600"
            }`}
          >
            <i className="ri-home-5-line text-2xl font-semibold"></i>
            <span className="text-xs mt-1 font-semibold">Home</span>
          </Link>
          <Link
            to="/student-login"
            className={`flex flex-col items-center p-2 rounded-lg ${
              location.pathname === "/student-login" ? "text-green-500" : "text-gray-800 hover:text-gray-600"
            }`}
          >
            <i className="ri-login-box-line text-2xl"></i>
            <span className="text-xs font-medium mt-1">Login</span>
          </Link>
        </>
      ) : (
        <>
          <Link
            to="/"
            className={`flex flex-col items-center p-2 rounded-lg ${
              location.pathname === "/" ? "text-green-500" : "text-gray-600 hover:text-white"
            }`}
          >
            <i className="ri-home-5-line text-2xl"></i>
            <span className="text-xs font-medium mt-1">Home</span>
          </Link>
          <Link
            to={role === "student" ? "/student-dashboard" : "/driver-dashboard"}
            className={`flex flex-col items-center p-2 rounded-lg ${
              location.pathname.includes("dashboard") ? "text-green-500" : "text-gray-600 hover:text-white"
            }`}
          >
            <i className="ri-file-list-3-line text-2xl"></i>
            <span className="text-xs font-medium mt-1">Bookings</span>
          </Link>
          <Link
            to="/ride-requests"
            className={`flex flex-col items-center p-2 rounded-lg ${
              location.pathname.includes("ride-requests") ? "text-green-500" : "text-gray-600 hover:text-white"
            }`}
          >
            <i className="ri-hand text-2xl"></i>
            <span className="text-xs font-medium mt-1">Ride Requests</span>
          </Link>
          <Link
            to={role === "student" ? "/student-profile" : "/driver-profile"}
            className={`flex flex-col items-center p-2 rounded-lg ${
              location.pathname.includes("profile") ? "text-green-500" : "text-gray-600 hover:text-white"
            }`}
          >
            <i className="ri-user-3-line text-2xl"></i>
            <span className="text-xs font-medium mt-1">Profile</span>
          </Link>
        </>
      )}
    </div>
  );
};

export default BottomNav;
