import { useState, useEffect } from "react";
import API from "../api";
import Loader from "../components/Loader";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

 
  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  // Password change
  const [showPwChange, setShowPwChange] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const flash = (message, type = "success") => {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => setMsg(""), 4000);
  };

  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/student/profile");
      setProfile(data);
      setForm({ name: data.name, phone: data.phone, email: data.email });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const { data } = await API.put("/student/profile", form);
      flash(data.message);
      setEditing(false);
      await fetchProfile();
    } catch (err) {
      flash(err.response?.data?.message || "Update failed", "error");
    }
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return flash("Passwords do not match", "error");
    }
    if (pwForm.newPassword.length < 6) {
      return flash("Password must be at least 6 characters", "error");
    }
    try {
      const { data } = await API.put("/auth/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      flash(data.message);
      setShowPwChange(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      flash(err.response?.data?.message || "Password change failed", "error");
    }
  };

  if (loading) return <Loader text="Loading profile..." />;
  if (!profile)
    return (
      <div className="text-center py-16 text-gray-500">Profile not found</div>
    );

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">
        👤 Student Profile
      </h1>

      {msg && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msgType === "error" ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}
        >
          {msg}
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-3xl">
            🎓
          </div>
          <div>
            <h2 className="text-xl font-bold font-[var(--font-heading)]">
              {profile.name}
            </h2>
            <p className="text-gray-500 text-sm">{profile.email}</p>
          </div>
        </div>

        {/* Stats */}
        {profile.stats && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-primary/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-primary-dark">
                {profile.stats.totalBookings}
              </div>
              <div className="text-xs text-gray-500">Total Bookings</div>
            </div>
            <div className="bg-info/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-info-dark">
                {profile.stats.createdRides}
              </div>
              <div className="text-xs text-gray-500">Rides Created</div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="space-y-3 mb-6">
          {editing ? (
            <>
              <div>
                <label className="text-gray-500 text-xs block mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="bg-success text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer border-none"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      name: profile.name,
                      phone: profile.phone,
                      email: profile.email,
                    });
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm cursor-pointer border-none"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between">
                <span className="text-gray-500 text-sm">Name</span>
                <span className="font-medium text-sm">{profile.name}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between">
                <span className="text-gray-500 text-sm">Phone</span>
                <span className="font-medium text-sm">{profile.phone}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between">
                <span className="text-gray-500 text-sm">Email</span>
                <span className="font-medium text-sm">{profile.email}</span>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-primary text-gray-900 py-2 rounded-xl text-sm font-bold cursor-pointer border-none"
              >
                ✏️ Edit Profile
              </button>
            </>
          )}
        </div>

        {/* Password Change */}
        <div className="border-t border-gray-100 pt-4">
          {showPwChange ? (
            <div className="space-y-3">
              <h3 className="font-bold text-sm font-[var(--font-heading)]">
                🔒 Change Password
              </h3>
              <input
                type="password"
                placeholder="Current Password"
                value={pwForm.currentPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, currentPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <input
                type="password"
                placeholder="New Password"
                value={pwForm.newPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, newPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={pwForm.confirmPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, confirmPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePasswordChange}
                  className="bg-success text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer border-none"
                >
                  Change Password
                </button>
                <button
                  onClick={() => {
                    setShowPwChange(false);
                    setPwForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm cursor-pointer border-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPwChange(true)}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium cursor-pointer border-none hover:bg-gray-200"
            >
              🔒 Change Password
            </button>
          )}
        </div>

        <button
                onClick={() => handleLogout()}
                className="w-full bg-red-500 text-white py-2 rounded-xl text-sm font-bold cursor-pointer border-none"
              >
               Logout
              </button>

        {/* Account Status */}
        {profile.is_globally_blocked && (
          <div className="mt-4 bg-error/10 text-error rounded-xl p-4 text-sm">
            ⚠️ Your account is globally blocked due to multiple no-shows.
            Contact admin.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
