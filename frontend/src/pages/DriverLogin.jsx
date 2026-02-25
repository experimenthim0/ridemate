import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";

const DriverLogin = () => {
  const [form, setForm] = useState({ auto_number: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/driver/login", form);
      login(data, data.token, "driver");
      navigate("/driver-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🛺</div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">
            Driver Login
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Login with your auto number
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 space-y-5"
        >
          {error && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <i className="ri-error-warning-line text-lg"></i>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Auto Number
            </label>
            <div className="relative">
              <i className="ri-taxi-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                required
                value={form.auto_number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    auto_number: e.target.value.toUpperCase(),
                  })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all uppercase"
                placeholder="e.g. KA01AB1234"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-auto-black py-3 rounded-xl font-bold text-base transition-colors disabled:opacity-60 cursor-pointer border-none"
          >
            {loading ? "🛺 Logging in..." : "🛺 Login"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Drivers are added by college admin only.
          </p>
        </form>
      </div>
    </div>
  );
};

export default DriverLogin;
