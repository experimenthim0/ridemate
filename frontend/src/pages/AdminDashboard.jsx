import { useState, useEffect } from "react";
import API from "../api";
import Loader from "../components/Loader";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [students, setStudents] = useState([]);
  const [rides, setRides] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [driverForm, setDriverForm] = useState({
    name: "",
    phone: "",
    auto_number: "",
    password: "",
    upi_id: "",
  });
  const [editingDriver, setEditingDriver] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    name: "",
    phone: "",
    auto_number: "",
    password: "",
    upi_id: "",
  });

  const fetchAll = async () => {
    try {
      const [s, d, st, r, c] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/drivers"),
        API.get("/admin/students"),
        API.get("/admin/rides"),
        API.get("/admin/complaints"),
      ]);
      setStats(s.data);
      setDrivers(d.data);
      setStudents(st.data);
      setRides(r.data);
      setComplaints(c.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const flash = (message) => {
    setMsg(message);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/drivers", driverForm);
      flash("Driver added successfully!");
      setShowAddDriver(false);
      setDriverForm({
        name: "",
        phone: "",
        auto_number: "",
        password: "",
        upi_id: "",
      });
      await fetchAll();
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const handleToggleDriver = async (id) => {
    try {
      const { data } = await API.put(`/admin/drivers/${id}/toggle`);
      flash(data.message);
      await fetchAll();
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const handleUpdateDriver = async (e, id) => {
    e.preventDefault();
    try {
      await API.put(`/admin/drivers/${id}`, updateForm);
      flash("Driver updated successfully");
      setEditingDriver(null);
      await fetchAll();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to update");
    }
  };

  const startEdit = (driver) => {
    setEditingDriver(driver._id);
    setUpdateForm({
      name: driver.name,
      phone: driver.phone,
      auto_number: driver.auto_number,
      password: "", // Leave blank unless they want to change it
      upi_id: driver.upi_id || "",
    });
  };

  const handleUnblock = async (id) => {
    try {
      await API.put(`/admin/students/${id}/unblock`);
      flash("Student unblocked");
      await fetchAll();
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const handleResolve = async (id, response) => {
    try {
      await API.put(`/admin/complaints/${id}`, {
        admin_response: response || "Resolved",
      });
      flash("Complaint resolved");
      await fetchAll();
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  if (loading) return <Loader text="Loading admin panel..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">
        <i className="ri-admin-line mr-2 text-primary"></i>Admin Dashboard
      </h1>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-info/10 text-info flex items-center gap-2">
          <i className="ri-information-line"></i>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["stats", "drivers", "students", "rides", "complaints"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm cursor-pointer border-none transition-colors capitalize ${activeTab === tab ? "bg-primary text-auto-black" : "bg-white text-gray-600 hover:bg-gray-100"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Drivers",
              value: stats.totalDrivers,
              icon: "ri-taxi-line",
              color: "bg-primary",
            },
            {
              label: "Active Drivers",
              value: stats.activeDrivers,
              icon: "ri-checkbox-circle-line",
              color: "bg-success",
            },
            {
              label: "Total Students",
              value: stats.totalStudents,
              icon: "ri-group-line",
              color: "bg-info",
            },
            {
              label: "Blocked Students",
              value: stats.blockedStudents,
              icon: "ri-forbid-line",
              color: "bg-error",
            },
            {
              label: "Total Rides",
              value: stats.totalRides,
              icon: "ri-road-map-line",
              color: "bg-primary",
            },
            {
              label: "Active Rides",
              value: stats.activeRides,
              icon: "ri-play-circle-line",
              color: "bg-success",
            },
            {
              label: "Total Bookings",
              value: stats.totalBookings,
              icon: "ri-ticket-line",
              color: "bg-info",
            },
            {
              label: "Pending Complaints",
              value: stats.pendingComplaints,
              icon: "ri-feedback-line",
              color: "bg-error",
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5">
              <div
                className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}
              >
                <i className={`${stat.icon} text-white text-lg`}></i>
              </div>
              <p className="text-2xl font-bold font-[var(--font-heading)]">
                {stat.value || 0}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Drivers */}
      {activeTab === "drivers" && (
        <div>
          <button
            onClick={() => setShowAddDriver(!showAddDriver)}
            className="bg-primary hover:bg-primary-dark text-auto-black px-6 py-3 rounded-xl font-bold cursor-pointer border-none mb-4 transition-colors"
          >
            <i className="ri-add-line mr-1"></i>
            {showAddDriver ? "Cancel" : "Add Driver"}
          </button>

          {showAddDriver && (
            <form
              onSubmit={handleAddDriver}
              className="bg-white rounded-2xl p-6 mb-4 space-y-4"
            >
              <h3 className="font-bold font-[var(--font-heading)]">
                Add New Driver
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={driverForm.name}
                  onChange={(e) =>
                    setDriverForm({ ...driverForm, name: e.target.value })
                  }
                  className="px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={driverForm.phone}
                  onChange={(e) =>
                    setDriverForm({ ...driverForm, phone: e.target.value })
                  }
                  className="px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  required
                  placeholder="Auto Number (e.g. KA01AB1234)"
                  value={driverForm.auto_number}
                  onChange={(e) =>
                    setDriverForm({
                      ...driverForm,
                      auto_number: e.target.value.toUpperCase(),
                    })
                  }
                  className="px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary uppercase"
                />
                <input
                  type="password"
                  required
                  placeholder="Password (min 6 chars)"
                  minLength="6"
                  value={driverForm.password}
                  onChange={(e) =>
                    setDriverForm({ ...driverForm, password: e.target.value })
                  }
                  className="px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="UPI ID (optional)"
                  value={driverForm.upi_id}
                  onChange={(e) =>
                    setDriverForm({ ...driverForm, upi_id: e.target.value })
                  }
                  className="px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="bg-success hover:bg-success-dark text-white px-6 py-2.5 rounded-xl font-bold cursor-pointer border-none transition-colors"
              >
                <i className="ri-check-line mr-1"></i>Add Driver
              </button>
            </form>
          )}

          <div className="space-y-2">
            {drivers.map((d) =>
              editingDriver === d._id ? (
                <form
                  key={`edit-${d._id}`}
                  onSubmit={(e) => handleUpdateDriver(e, d._id)}
                  className="bg-white rounded-2xl p-4 space-y-3 border-2 border-primary"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold">Edit Driver</h4>
                    <button
                      type="button"
                      onClick={() => setEditingDriver(null)}
                      className="text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
                    >
                      <i className="ri-close-line text-xl"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      value={updateForm.name}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, name: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone"
                      value={updateForm.phone}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, phone: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Auto Number"
                      value={updateForm.auto_number}
                      onChange={(e) =>
                        setUpdateForm({
                          ...updateForm,
                          auto_number: e.target.value.toUpperCase(),
                        })
                      }
                      className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary uppercase text-sm"
                    />
                    <input
                      type="text"
                      placeholder="UPI ID"
                      value={updateForm.upi_id}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, upi_id: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="text"
                      placeholder="New Password (leave blank to keep current)"
                      minLength="6"
                      value={updateForm.password}
                      onChange={(e) =>
                        setUpdateForm({
                          ...updateForm,
                          password: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm md:col-span-2"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-dark text-auto-black px-4 py-2 rounded-lg font-bold text-sm cursor-pointer border-none transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  key={d._id}
                  className="bg-white rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${d.is_active ? "bg-success" : "bg-error"}`}
                    ></div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {d.name}
                        <button
                          onClick={() => startEdit(d)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded p-1 text-xs cursor-pointer border-none"
                          title="Edit Driver"
                        >
                          <i className="ri-pencil-line"></i>
                        </button>
                      </p>
                      <p className="text-sm text-gray-500">
                        {d.auto_number} • {d.phone}
                      </p>
                      {d.upi_id && (
                        <p className="text-xs text-gray-400">UPI: {d.upi_id}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleDriver(d._id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer border-none transition-colors ${d.is_active ? "bg-error hover:bg-error-dark text-white" : "bg-success hover:bg-success-dark text-white"}`}
                  >
                    {d.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Students */}
      {activeTab === "students" && (
        <div className="space-y-2">
          {students.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-gray-500">
                  {s.phone} • {s.email}
                </p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-gray-400">
                    No-shows: {s.no_show_count}
                  </span>
                  {s.is_globally_blocked && (
                    <span className="text-xs text-error font-bold">
                      🚫 BLOCKED
                    </span>
                  )}
                </div>
              </div>
              {s.is_globally_blocked && (
                <button
                  onClick={() => handleUnblock(s._id)}
                  className="bg-success text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer border-none hover:bg-success-dark transition-colors"
                >
                  Unblock
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rides */}
      {activeTab === "rides" && (
        <div className="space-y-2">
          {rides.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 font-bold">
                    <span>{r.from}</span>
                    <i className="ri-arrow-right-line text-primary"></i>
                    <span>{r.to}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Driver: {r.driver_id?.name} ({r.driver_id?.auto_number})
                  </p>
                  <p className="text-sm text-gray-500">
                    {r.filled_seats}/{r.total_seats} seats
                  </p>
                </div>
                <span
                  className={`badge-${r.status} px-3 py-1 rounded-lg text-xs font-bold`}
                >
                  {r.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaints */}
      {activeTab === "complaints" && (
        <div className="space-y-3">
          {complaints.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <p className="text-gray-500">No complaints</p>
            </div>
          ) : (
            complaints.map((c) => (
              <div key={c._id} className="bg-white rounded-2xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold font-[var(--font-heading)]">
                      {c.subject}
                    </h3>
                    <p className="text-sm text-gray-500">
                      By {c.user_name} ({c.user_role}) •{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${c.status === "pending" ? "bg-primary text-auto-black" : "bg-success text-white"}`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{c.message}</p>
                {c.admin_response && (
                  <p className="text-sm text-info bg-info/10 px-3 py-2 rounded-xl">
                    <i className="ri-reply-line mr-1"></i>
                    {c.admin_response}
                  </p>
                )}
                {c.status === "pending" && (
                  <button
                    onClick={() => {
                      const resp = prompt("Enter response (or leave blank):");
                      handleResolve(c._id, resp);
                    }}
                    className="mt-2 bg-success text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer border-none hover:bg-success-dark transition-colors"
                  >
                    <i className="ri-check-line mr-1"></i>Resolve
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
