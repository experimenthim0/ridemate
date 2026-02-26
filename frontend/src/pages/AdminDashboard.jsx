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
  const [fakeReports, setFakeReports] = useState([]);
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
      const [s, d, st, r, c, fr] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/drivers"),
        API.get("/admin/students"),
        API.get("/admin/rides"),
        API.get("/admin/complaints"),
        API.get("/admin/fake-ride-reports"),
      ]);
      setStats(s.data);
      setDrivers(d.data);
      setStudents(st.data);
      setRides(r.data);
      setComplaints(c.data);
      setFakeReports(fr.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDeactivateRide = async (id) => {
    // FIX: Added window.confirm to prevent no-undef errors
    if (!window.confirm("Are you sure you want to manually deactivate this ride?")) return;
    try {
      await API.put(`/admin/rides/${id}/deactivate`);
      flash("Ride deactivated successfully");
      await fetchAll();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to deactivate ride");
    }
  };

  const handleCleanUpBookings = async () => {
    // FIX: Added window.confirm to prevent no-undef errors
    if (!window.confirm("Delete all cancelled bookings permanently?")) return;
    try {
      const { data } = await API.delete("/admin/bookings/cancelled");
      flash(data.message);
      await fetchAll();
    } catch (err) {
      flash(err.response?.data?.message || "Failed cleanup");
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
        {[
          "stats",
          "drivers",
          "students",
          "rides",
          "complaints",
          "fake-reports",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm cursor-pointer border-none transition-colors capitalize ${activeTab === tab ? "bg-primary text-auto-black" : "bg-white text-gray-600 hover:bg-gray-100"}`}
          >
            {tab.replace("-", " ")}
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
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
               <div className={`absolute top-0 left-0 w-1 ${stat.color} h-full group-hover:w-2 transition-all`}></div>
              <div
                className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-xl flex items-center justify-center mb-4`}
              >
                <i className={`${stat.icon} ${stat.color.replace('bg-', 'text-')} text-xl group-hover:scale-110 transition-transform`}></i>
              </div>
              <p className="text-3xl font-extrabold font-[var(--font-heading)] text-gray-800">
                {stat.value || 0}
              </p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stats Actions Section */}
      {activeTab === "stats" && (
        <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
               <i className="ri-settings-3-line text-primary"></i> System Maintenance
            </h3>
            <div className="flex gap-4 flex-wrap">
               <button 
                  onClick={handleCleanUpBookings}
                  className="bg-error/10 hover:bg-error/20 text-error px-5 py-2.5 rounded-xl font-semibold border-none cursor-pointer transition-colors flex items-center gap-2"
               >
                 <i className="ri-delete-bin-line"></i> Delete Cancelled Bookings
               </button>
            </div>
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
                      {/* FIX: Changed <p> to <div> to prevent invalid HTML nesting (button inside p) */}
                      <div className="font-medium flex items-center gap-2">
                        {d.name}
                        <button
                          onClick={() => startEdit(d)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded p-1 text-xs cursor-pointer border-none"
                          title="Edit Driver"
                        >
                          <i className="ri-pencil-line"></i>
                        </button>
                      </div>
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
                    {r.type === "student_sharing" && (
                      <span className="bg-warning text-white px-2 py-0.5 rounded text-[10px] ml-2">
                        RIDESHARING
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {r.type === "student_sharing" ? (
                      <>
                        Creator (Student): {r.student_id?.name} (
                        {r.student_id?.phone})
                      </>
                    ) : (
                      <>
                        Driver: {r.driver_id?.name} ({r.driver_id?.auto_number})
                      </>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {r.filled_seats}/{r.total_seats} seats
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`badge-${r.status} px-3 py-1 rounded-lg text-xs font-bold block mb-2`}
                  >
                    {r.status.toUpperCase()}
                  </span>
                  
                  {r.status === "active" && (
                    <button
                      onClick={() => handleDeactivateRide(r._id)}
                      className="text-xs bg-error hover:bg-error-dark text-white px-3 py-1.5 rounded-lg font-bold border-none cursor-pointer transition-colors"
                      title="Deactivate ride immediately"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
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
                      // FIX: Added window.prompt to prevent no-undef errors
                      const resp = window.prompt("Enter response (or leave blank):");
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

      {/* Fake Ride Reports */}
      {activeTab === "fake-reports" && (
        <div className="space-y-3">
          {fakeReports.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <p className="text-gray-500">No fake ride reports</p>
            </div>
          ) : (
            fakeReports.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-2xl p-5 border border-error/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      <i className="ri-alarm-warning-line text-error"></i>
                      Fake Ride Report (Ride: {r.from} to {r.to})
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      <strong>Created By (Student):</strong>{" "}
                      {r.student_id?.name} ({r.student_id?.phone})
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Current Ban Count:</strong>{" "}
                      {r.student_id?.banCount || 0}
                    </p>
                    {r.student_id?.rideCreationBanUntil &&
                      new Date(r.student_id?.rideCreationBanUntil) >
                        new Date() && (
                        <p className="text-sm text-error font-bold">
                          Banned until:{" "}
                          {new Date(
                            r.student_id.rideCreationBanUntil,
                          ).toLocaleDateString()}
                        </p>
                      )}
                  </div>
                  <span className="px-3 py-1 bg-error text-white rounded-lg text-xs font-bold">
                    {/* FIX: Added optional chaining to prevent crash if reports array is undefined */}
                    {r.reports?.length || 0} Report(s)
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold mb-2">Reported By:</h4>
                  <ul className="text-sm text-gray-600 list-disc pl-5">
                    {/* FIX: Added optional chaining to prevent crash if reports array is undefined */}
                    {r.reports?.map((reporter, idx) => (
                      <li key={idx}>
                        {reporter.name} ({reporter.phone})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;