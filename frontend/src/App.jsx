import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

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
import Complaints from "./pages/Complaints";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import DriverConsent from "./pages/DriverConsent";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
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

              {/* Protected - Any authenticated user */}
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute allowedRoles={["student", "driver"]}>
                    <Complaints />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
