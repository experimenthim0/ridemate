import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

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
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img
            src="/icons8-auto-rickshaw-94.png"
            alt=""
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <span className="text-lg md:text-xl font-bold text-primary">
            Ride<span className="text-white">Mate</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/student-login"
                className="bg-neutral-700 px-3 py-1 rounded-lg text-sm hover:text-primary"
              > <i className="ri-group-line mr-1"></i>
                Student
              </Link>
              <Link
                to="/driver-login"
                className="bg-neutral-700 px-3 py-1 rounded-lg text-sm hover:text-primary"
              ><i className="ri-taxi-line mr-1"></i>
                Driver
              </Link>
            </>
          ) : (
            <>
              {role === "student" && (
                <Link
                  to="/student-dashboard"
                  className="bg-neutral-700 px-3 py-1 rounded-lg text-sm"
                ><i className="ri-dashboard-line mr-1"></i>
                  Dashboard
                </Link>
              )}
              {role === "driver" && (
                <>
                  <Link
                    to="/driver-dashboard"
                    className="bg-neutral-700 px-3 py-1 rounded-lg text-sm"
                  ><i className="ri-dashboard-line mr-1"></i>
                    Dashboard
                  </Link>
                  <Link
                    to="/driver-profile"
                    className="bg-neutral-700 px-3 py-1 rounded-lg text-sm"
                  ><i className="ri-user-line mr-1"></i>
                    Profile
                  </Link>
                </>
              )}
              {role === "admin" && (
                <Link
                  to="/admin-dashboard"
                  className="bg-neutral-700 px-3 py-1 rounded-lg text-sm"
                >
                  Dashboard
                </Link>
              )}

              <Link
                to="/complaints"
                className="bg-neutral-700 px-3 py-1 rounded-lg text-sm"
              ><i className="ri-feedback-line mr-1"></i>
                Complaints
              </Link>

              <button
                onClick={handleLogout}
                className="bg-error px-3 py-1 rounded-lg text-sm"
              > <i className="ri-logout-box-r-line mr-1"></i>
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-auto-black px-4 pb-4 flex flex-col gap-3">
          {!user ? (
            <>
              <Link
                to="/student-login"
                onClick={() => setIsOpen(false)}
                className="bg-neutral-700 px-3 py-2 rounded-lg"
              ><i className="ri-group-line mr-1"></i>
                Student
              </Link>
              <Link
                to="/driver-login"
                onClick={() => setIsOpen(false)}
                className="bg-neutral-700 px-3 py-2 rounded-lg"
              ><i className="ri-taxi-line mr-1"></i>
                Driver
              </Link>
            </>
          ) : (
            <>
              {role === "student" && (
                <Link
                  to="/student-dashboard"
                  onClick={() => setIsOpen(false)}
                  className="bg-neutral-700 px-3 py-2 rounded-lg"
                ><i className="ri-dashboard-line mr-1"></i>
                  Dashboard
                </Link>
              )}

              {role === "driver" && (
                <>
                  <Link
                    to="/driver-dashboard"
                    onClick={() => setIsOpen(false)}
                    className="bg-neutral-700 px-3 py-2 rounded-lg"
                  ><i className="ri-dashboard-line mr-1"></i>
                    Dashboard
                  </Link>
                  <Link
                    to="/driver-profile"
                    onClick={() => setIsOpen(false)}
                    className="bg-neutral-700 px-3 py-2 rounded-lg"
                  ><i className="ri-user-line mr-1"></i>
                    Profile
                  </Link>
                </>
              )}

              {role === "admin" && (
                <Link
                  to="/admin-dashboard"
                  onClick={() => setIsOpen(false)}
                  className="bg-neutral-700 px-3 py-2 rounded-lg"
                ><i className="ri-dashboard-line mr-1"></i>
                  Dashboard
                </Link>
              )}

              <Link
                to="/complaints"
                onClick={() => setIsOpen(false)}
                className="bg-neutral-700 px-3 py-2 rounded-lg"
              ><i className="ri-feedback-line mr-1"></i>
                Complaints
              </Link>

              <button
                onClick={handleLogout}
                className="bg-error px-3 py-2 rounded-lg"
              ><i className="ri-logout-box-r-line mr-1"></i>
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;