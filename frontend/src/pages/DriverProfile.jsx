import { useState, useEffect } from "react";
import API from "../api";
import Loader from "../components/Loader";

const DriverProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upiId, setUpiId] = useState("");
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

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
      const { data } = await API.get("/driver/profile");
      setProfile(data);
      setUpiId(data.upi_id || "");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateUPI = async () => {
    try {
      await API.put("/driver/profile", { upi_id: upiId });
      flash("UPI ID updated!");
      setEditing(false);
      await fetchProfile();
    } catch (err) {
      flash(err.response?.data?.message || "Failed", "error");
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
        <i className="ri-user-line mr-2 text-primary"></i>Driver Profile
      </h1>

      {msg && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msgType === "error" ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}
        >
          {msg}
        </div>
      )}

      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-3xl">
            🛺
          </div>
          <div>
            <h2 className="text-xl font-bold font-[var(--font-heading)]">
              {profile.name}
            </h2>
            <p className="text-gray-500">{profile.auto_number}</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-lg text-xs font-bold ${profile.is_active ? "bg-success text-white" : "bg-error text-white"}`}
            >
              {profile.is_active ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-3 flex justify-between">
            <span className="text-gray-500 text-sm">Phone</span>
            <span className="font-medium text-sm">{profile.phone}</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex justify-between">
            <span className="text-gray-500 text-sm">Auto Number</span>
            <span className="font-medium text-sm">{profile.auto_number}</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">UPI ID</span>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="text-primary text-sm font-medium cursor-pointer bg-transparent border-none"
                >
                  <i className="ri-edit-line mr-1"></i>Edit
                </button>
              ) : null}
            </div>
            {editing ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="yourname@upi"
                />
                <button
                  onClick={handleUpdateUPI}
                  className="bg-success text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer border-none"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setUpiId(profile.upi_id || "");
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm cursor-pointer border-none"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="font-medium text-sm mt-1">
                {profile.upi_id || "Not set"}
              </p>
            )}
          </div>
        </div>

        {/* QR Code */}
        {profile.qr && (
          <div className="bg-primary/10 rounded-xl p-6 text-center">
            <h3 className="font-bold mb-3 font-[var(--font-heading)]">
              <i className="ri-qr-code-line mr-1"></i>Your Payment QR
            </h3>
            <img
              src={profile.qr.qrDataUrl}
              alt="UPI QR Code"
              className="mx-auto rounded-xl mb-3"
              style={{ width: 200 }}
            />
            <p className="text-xs text-gray-500 break-all">
              {profile.qr.upiString}
            </p>
          </div>
        )}

        {/* Password Change */}
        <div className="border-t border-gray-100 pt-4 mb-4 mt-6">
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
                  Change
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
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium cursor-pointer border-none hover:bg-gray-200 transition-colors"
            >
              🔒 Change Password
            </button>
          )}
        </div>

        {!profile.upi_id && (
          <div className="bg-primary/10 text-primary-dark rounded-xl p-4 text-center text-sm">
            <i className="ri-information-line mr-1"></i>Set your UPI ID to
            enable payment QR codes for passengers.
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverProfile;
