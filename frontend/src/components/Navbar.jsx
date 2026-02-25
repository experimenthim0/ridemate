import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-auto-black text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-3xl">🛺</span>
          <span className="text-xl font-bold font-[var(--font-heading)] text-primary">
            RideMate
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/student-login"
                className="text-gray-300 hover:text-primary transition-colors text-sm font-medium no-underline"
              >
                <i className="ri-user-line mr-1"></i>Student
              </Link>
              <Link
                to="/driver-login"
                className="text-gray-300 hover:text-primary transition-colors text-sm font-medium no-underline"
              >
                <i className="ri-taxi-line mr-1"></i>Driver
              </Link>
              <Link
                to="/admin-login"
                className="text-gray-300 hover:text-primary transition-colors text-sm font-medium no-underline"
              >
                <i className="ri-admin-line mr-1"></i>Admin
              </Link>
            </>
          ) : (
            <>
              {role === "student" && (
                <Link
                  to="/student-dashboard"
                  className="text-gray-300 hover:text-primary transition-colors text-sm font-medium no-underline"
                >
                  <i className="ri-dashboard-line mr-1"></i>Dashboard
                </Link>
              )}
              {role === "driver" && (
                <>
                  <Link
                    to="/driver-dashboard"
                    className="text-gray-300 hover:text-primary transition-colors text-sm font-medium no-underline"
                  >
                    <i className="ri-dashboard-line mr-1"></i>Dashboard
                  </Link>
                  <Link
                    to="/driver-profile"
                    className="text-gray-300 hover:text-primary transition-colors text-sm font-medium no-underline"
                  >
                    <i className="ri-user-line mr-1"></i>Profile
                  </Link>
                </>
              )}
              {role === "admin" && (
                <Link
                  to="/admin-dashboard"
                  className="text-gray-300 hover:text-primary transition-colors text-sm font-medium no-underline"
                >
                  <i className="ri-dashboard-line mr-1"></i>Dashboard
                </Link>
              )}
              <Link
                to="/complaints"
                className="text-gray-300 hover:text-primary transition-colors text-sm font-medium no-underline"
              >
                <i className="ri-feedback-line mr-1"></i>Complaints
              </Link>
              <button
                onClick={handleLogout}
                className="bg-error hover:bg-error-dark text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none"
              >
                <i className="ri-logout-box-r-line mr-1"></i>Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
