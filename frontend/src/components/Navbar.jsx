import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import InstallButton from "./InstallButton";

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <nav className="bg-auto-black text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 lg:py-3 flex items-center justify-center lg:justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img
            src="/icons8-auto-rickshaw-94.png"
            alt=""
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <span className="text-2xl md:text-xl font-bold text-primary">
            Ride<span className="text-white">Mate</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {/* <Link
            to="/about"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            About
          </Link> */}
          {!user ? (
            <>
              <Link
                to="/student-login"
                className="bg-neutral-700 px-3 py-1 rounded-lg text-sm hover:text-primary"
              >
                {" "}
                <i className="ri-group-line mr-1"></i>
                Student
              </Link>
              <Link
                to="/driver-login"
                className="bg-neutral-700 px-3 py-1 rounded-lg text-sm hover:text-primary"
              >
                <i className="ri-taxi-line mr-1"></i>
                Driver
              </Link>
              <InstallButton />
            </>
          ) : (
            <>
              {role === "student" && (
                <>
                  <Link
                    to="/student-dashboard"
                    className="bg-neutral-700 px-3 py-1 rounded-lg text-sm"
                  >
                    <i className="ri-dashboard-line mr-1"></i>
                    Dashboard
                  </Link>
                  <Link
                    to="/student-profile"
                    className="bg-neutral-700 px-3 py-1 rounded-lg text-sm"
                  >
                    <i className="ri-user-line mr-1"></i>
                    Profile
                  </Link>
                </>
              )}
              {role === "driver" && (
                <>
                  <Link
                    to="/driver-dashboard"
                    className="bg-neutral-700 px-3 py-1 rounded-lg text-sm"
                  >
                    <i className="ri-dashboard-line mr-1"></i>
                    Dashboard
                  </Link>
              <Link
                to="/driver-profile"
                className="bg-neutral-700 px-3 py-1 rounded-lg text-sm"
              >
                <i className="ri-user-line mr-1"></i>
                Profile
              </Link>
            </>
          )}
          {role === "admin" && (
            <Link
              to="/admin-dashboard"
              className="bg-neutral-700 px-3 py-1 rounded-lg text-sm"
            >
              <i className="ri-dashboard-line mr-1"></i>
              Dashboard
            </Link>
          )}

          {(role === "student" || role === "driver") && (
            <>
              <NotificationIcon />
              <Link
                to="/ride-requests"
                className="bg-neutral-700 px-3 py-1 rounded-lg text-sm text-primary font-bold relative"
              >
                <i className="ri-question-answer-line mr-1"></i>
                Requests
                <RideRequestBubble />
              </Link>
            </>
          )}

          <Link
            to="/complaints"
            className="bg-neutral-700 px-3 py-1 rounded-lg text-sm"
          >
            <i className="ri-feedback-line mr-1"></i>
            Complaints
          </Link>

          <InstallButton />

          <button
            onClick={handleLogout}
            className="bg-error px-3 py-1 rounded-lg text-sm"
          >
            {" "}
            <i className="ri-logout-box-r-line mr-1"></i>
            Logout
          </button>
        </>
      )}
    </div>

        {/* Mobile Hamburger (Now hidden per request, left only for admins/desktops if needed) */}
        <button
          className="hidden text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu - Hidden as bottom nav replaces it */}
      {isOpen && (
        <div className="hidden bg-auto-black px-4 pb-4 flex-col gap-3">
          {!user ? (
            <>
              <Link
                to="/student-login"
                onClick={() => setIsOpen(false)}
                className="bg-neutral-700 px-3 py-2 rounded-lg"
              >
                <i className="ri-group-line mr-1"></i>
                Student
              </Link>
              <Link
                to="/driver-login"
                onClick={() => setIsOpen(false)}
                className="bg-neutral-700 px-3 py-2 rounded-lg"
              >
                <i className="ri-taxi-line mr-1"></i>
                Driver
              </Link>
            </>
          ) : (
            <>
              {role === "student" && (
                <>
                  <Link
                    to="/student-dashboard"
                    onClick={() => setIsOpen(false)}
                    className="bg-neutral-700 px-3 py-2 rounded-lg"
                  >
                    <i className="ri-dashboard-line mr-1"></i>
                    Dashboard
                  </Link>
                  <Link
                    to="/student-profile"
                    onClick={() => setIsOpen(false)}
                    className="bg-neutral-700 px-3 py-2 rounded-lg"
                  >
                    <i className="ri-user-line mr-1"></i>
                    Profile
                  </Link>
                </>
              )}

              {role === "driver" && (
                <>
                  <Link
                    to="/driver-dashboard"
                    onClick={() => setIsOpen(false)}
                    className="bg-neutral-700 px-3 py-2 rounded-lg"
                  >
                    <i className="ri-dashboard-line mr-1"></i>
                    Dashboard
                  </Link>
                  <Link
                    to="/driver-profile"
                    onClick={() => setIsOpen(false)}
                    className="bg-neutral-700 px-3 py-2 rounded-lg"
                  >
                    <i className="ri-user-line mr-1"></i>
                    Profile
                  </Link>
                </>
              )}

              {role === "admin" && (
                <Link
                  to="/admin-dashboard"
                  onClick={() => setIsOpen(false)}
                  className="bg-neutral-700 px-3 py-2 rounded-lg"
                >
                  <i className="ri-dashboard-line mr-1"></i>
                  Dashboard
                </Link>
              )}

              {(role === "student" || role === "driver") && (
                <Link
                  to="/ride-requests"
                  onClick={() => setIsOpen(false)}
                  className="bg-neutral-700 px-3 py-2 rounded-lg text-primary font-bold"
                >
                  <i className="ri-question-answer-line mr-1"></i>
                  Requests
                </Link>
              )}

              <Link
                to="/complaints"
                onClick={() => setIsOpen(false)}
                className="bg-neutral-700 px-3 py-2 rounded-lg"
              >
                <i className="ri-feedback-line mr-1"></i>
                Complaints
              </Link>

              <button
                onClick={handleLogout}
                className="bg-error px-3 py-2 rounded-lg"
              >
                <i className="ri-logout-box-r-line mr-1"></i>
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

import { useNotification } from "../context/NotificationContext";

const NotificationIcon = () => {
    const { unreadCount } = useNotification();
    return (
        <Link to="/notifications" className="relative p-1 hover:text-primary transition-colors">
            <i className="ri-notification-3-line text-xl"></i>
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-black text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-black shadow-sm tracking-tighter">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    );
};

const RideRequestBubble = () => {
    const { showRideRequestBubble } = useNotification();
    if (!showRideRequestBubble) return null;
    return (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-black"></span>
        </span>
    );
};

export default Navbar;
