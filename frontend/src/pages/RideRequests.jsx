import { useState, useEffect } from "react";
import { format } from "date-fns";
import API from "../api";
import Loader from "../components/Loader";

const RideRequests = () => {
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'my'
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    from_location: "",
    to_location: "",
    requested_date: "",
    requested_time: "",
    seats_needed: 1,
    note: "",
  });

  // Response state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMsg, setResponseMsg] = useState("");

  const role = localStorage.getItem("role"); // 'student' or 'driver'

  const flash = (message, type = "success") => {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => setMsg(""), 4000);
  };

  const fetchRequests = async () => {
    try {
      const { data } = await API.get("/ride-requests");
      setRequests(data);
      if (role === "student") {
        const myData = await API.get("/ride-requests/my");
        setMyRequests(myData.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (form.from_location === form.to_location) {
        return flash("From and To locations cannot be the same", "error");
      }
      const { data } = await API.post("/ride-requests", form);
      flash(data.message);
      setShowForm(false);
      setForm({
        from_location: "",
        to_location: "",
        requested_date: "",
        requested_time: "",
        seats_needed: 1,
        note: "",
      });
      fetchRequests();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to create request", "error");
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post(
        `/ride-requests/${selectedRequest._id}/respond`,
        { message: responseMsg },
      );
      flash(data.message);
      setSelectedRequest(null);
      setResponseMsg("");
      fetchRequests();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to respond", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      const { data } = await API.delete(`/ride-requests/${id}`);
      flash(data.message);
      fetchRequests();
    } catch (err) {
      flash(err.response?.data?.message || "Delete failed", "error");
    }
  };

  const handleFulfill = async (id) => {
    try {
      const { data } = await API.put(`/ride-requests/${id}/fulfill`);
      flash(data.message);
      fetchRequests();
    } catch (err) {
      flash(err.response?.data?.message || "Fulfill failed", "error");
    }
  };

  if (loading) return <Loader text="Loading requests..." />;

  const displayList = activeTab === "all" ? requests : myRequests;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          <i className="ri-hand text-2xl "></i> Ride Requests
        </h1>
        {role === "student" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-gray-900 px-4 py-2 rounded-xl font-bold border-none cursor-pointer flex items-center shadow-sm hover:scale-[1.02] transition-transform"
          >
            {showForm ? "✕ Cancel Request" : "➕ Need a Ride?"}
          </button>
        )}
      </div>

      {msg && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${msgType === "error" ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}
        >
          {msg}
        </div>
      )}

      {/* Create Request Form */}
      {showForm && role === "student" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <h2 className="text-lg font-bold mb-4 font-[var(--font-heading)]">
            Create a Ride Request
          </h2>
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-xs text-gray-500 mb-1 block">From</label>
              <input
                required
                type="text"
                value={form.from_location}
                onChange={(e) =>
                  setForm({ ...form, from_location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
                placeholder="Pickup location"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">To</label>
              <input
                required
                type="text"
                value={form.to_location}
                onChange={(e) =>
                  setForm({ ...form, to_location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
                placeholder="Destination"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input
                required
                type="date"
                value={form.requested_date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setForm({ ...form, requested_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Time</label>
              <input
                required
                type="time"
                value={form.requested_time}
                onChange={(e) =>
                  setForm({ ...form, requested_time: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Seats Needed
              </label>
              <input
                required
                type="number"
                min="1"
                max="10"
                value={form.seats_needed}
                onChange={(e) =>
                  setForm({ ...form, seats_needed: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Note (Optional)
              </label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
                placeholder="E.g. Will share cost 50/50"
              />
            </div>
            <div className="md:col-span-2 mt-2">
              <button
                type="submit"
                className="bg-primary text-gray-900 px-6 py-2 rounded-xl font-bold w-full border-none cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      {role === "student" && (
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6 w-max">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-bold border-none cursor-pointer transition-colors ${activeTab === "all" ? "bg-white shadow text-primary" : "text-gray-500 bg-transparent"}`}
          >
            Community Requests
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-lg text-sm font-bold border-none cursor-pointer transition-colors ${activeTab === "my" ? "bg-white shadow text-primary" : "text-gray-500 bg-transparent"}`}
          >
            My Requests
          </button>
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
          No ride requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayList.map((req) => (
            <div
              key={req._id}
              className="bg-white border text-left border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center font-bold text-sm">
                    {req.student_id?.name
                      ? req.student_id.name.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">
                      {req.student_id?.name || "Unknown"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Needs {req.seats_needed} seat
                      {req.seats_needed > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                {req.status === "open" && (
                  <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-md font-bold">
                    OPEN
                  </span>
                )}
                {req.status === "fulfilled" && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-bold">
                    FULFILLED
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm font-medium my-3">
                <span className="text-gray-800 bg-gray-50 px-2 py-1 rounded">
                  {req.from_location}
                </span>
                <i className="ri-arrow-right-line text-gray-300"></i>
                <span className="text-gray-800 bg-gray-50 px-2 py-1 rounded">
                  {req.to_location}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mb-3 bg-gray-50/50 p-2 rounded-lg">
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-line"></i>{" "}
                  {(() => {
                    try {
                      return format(
                        new Date(req.requested_date),
                        "MMM d, yyyy",
                      );
                    } catch {
                      return req.requested_date;
                    }
                  })()}
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-time-line"></i> {req.requested_time}
                </span>
              </div>

              {req.note && (
                <p className="text-sm text-gray-600 italic bg-amber-50 p-2 rounded-lg mb-3">
                  "{req.note}"
                </p>
              )}

              {/* Responses Block */}
              {req.responses && req.responses.length > 0 && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3 mb-3">
                  <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Responses ({req.responses.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {req.responses.map((resp, i) => (
                      <div
                        key={i}
                        className={`text-xs p-2 rounded-lg ${resp.responder_model === "Driver" ? "bg-primary/5 border border-primary/20" : "bg-white border border-gray-200"}`}
                      >
                        <span className="font-bold block text-gray-800">
                          {resp.responder_id?.name || "Someone"}{" "}
                          <span className="text-gray-400 font-normal">
                            ({resp.responder_model})
                          </span>
                        </span>
                        <span className="text-gray-600 break-words">
                          {resp.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
                {activeTab === "all" &&
                  req.status === "open" &&
                  req.student_id?._id !== localStorage.getItem("userId") && (
                    <button
                      onClick={() =>
                        setSelectedRequest(
                          selectedRequest?._id === req._id ? null : req,
                        )
                      }
                      className="flex-1 bg-primary/10 text-primary-dark font-bold text-sm py-2 rounded-xl border-none cursor-pointer"
                    >
                      {selectedRequest?._id === req._id
                        ? "Cancel Reply"
                        : "Reply"}
                    </button>
                  )}

                {activeTab === "my" && req.status === "open" && (
                  <>
                    <button
                      onClick={() => handleFulfill(req._id)}
                      className="flex-1 bg-success/10 text-success font-bold text-sm py-2 rounded-xl border-none cursor-pointer"
                    >
                      Mark Fulfilled
                    </button>
                    <button
                      onClick={() => handleDelete(req._id)}
                      className="flex-1 bg-error/10 text-error font-bold text-sm py-2 rounded-xl border-none cursor-pointer"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

              {/* Reply Form (Inline) */}
              {selectedRequest?._id === req._id && (
                <form
                  onSubmit={handleRespond}
                  className="mt-3 flex gap-2 animate-fade-in"
                >
                  <input
                    required
                    type="text"
                    value={responseMsg}
                    onChange={(e) => setResponseMsg(e.target.value)}
                    placeholder="Type a response..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-gray-900 px-3 py-2 rounded-xl font-bold text-sm border-none cursor-pointer"
                  >
                    <i className="ri-send-plane-fill"></i>
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RideRequests;
