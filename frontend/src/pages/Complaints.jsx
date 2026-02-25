import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

const Complaints = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: "", message: "" });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showMine, setShowMine] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/complaints", form);
      setMsg(data.message);
      setForm({ subject: "", message: "" });
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed");
    }
    setLoading(false);
  };

  const fetchMyComplaints = async () => {
    try {
      const { data } = await API.get("/complaints/my");
      setComplaints(data);
      setShowMine(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">
        <i className="ri-feedback-line mr-2 text-primary"></i>Complaints
      </h1>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-success/10 text-success flex items-center gap-2">
          <i className="ri-check-line"></i>
          {msg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 mb-6 space-y-4"
      >
        <h3 className="font-bold font-[var(--font-heading)]">
          Submit a Complaint
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Subject
          </label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
            placeholder="What is the issue about?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Message
          </label>
          <textarea
            required
            rows="4"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Describe your complaint in detail..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary-dark text-auto-black px-6 py-2.5 rounded-xl font-bold cursor-pointer border-none disabled:opacity-60 transition-colors"
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>

      <button
        onClick={fetchMyComplaints}
        className="text-info hover:underline text-sm font-medium cursor-pointer bg-transparent border-none mb-4"
      >
        <i className="ri-history-line mr-1"></i>View My Complaints
      </button>

      {showMine && (
        <div className="space-y-3">
          {complaints.length === 0 ? (
            <p className="text-gray-500 text-sm">No complaints yet</p>
          ) : (
            complaints.map((c) => (
              <div key={c._id} className="bg-white rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm">{c.subject}</h4>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${c.status === "pending" ? "bg-primary text-auto-black" : "bg-success text-white"}`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{c.message}</p>
                {c.admin_response && (
                  <div className="mt-2 bg-info/10 text-info px-3 py-2 rounded-xl text-sm">
                    <i className="ri-reply-line mr-1"></i>
                    {c.admin_response}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Complaints;
