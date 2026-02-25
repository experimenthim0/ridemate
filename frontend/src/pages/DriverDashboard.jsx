import { useState, useEffect } from "react";
import { LOCATIONS } from "../constants/locations";
import API from "../api";
import Loader from "../components/Loader";

const DriverDashboard = () => {
  const [rides, setRides] = useState([]);
  const [activeTab, setActiveTab] = useState("rides");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [rideForm, setRideForm] = useState({
    from: "",
    to: "",
    total_seats: 3,
    departure_time: "",
    departure_date: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [blocked, setBlocked] = useState([]);

  const fetchRides = async () => {
    try {
      const { data } = await API.get("/driver/rides");
      setRides(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBlocked = async () => {
    try {
      const { data } = await API.get("/driver/blocked");
      setBlocked(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchRides(), fetchBlocked()]);
      setLoading(false);
    };
    load();
  }, []);

  const flash = (message) => {
    setMsg(message);
    setTimeout(() => setMsg(""), 4000);
  };

  const handleCreateRide = async (e) => {
    e.preventDefault();
    try {
      await API.post("/driver/rides", rideForm);
      flash("Ride created!");
      setShowForm(false);
      setRideForm({
        from: "",
        to: "",
        total_seats: 3,
        departure_time: "",
        departure_date: "",
      });
      await fetchRides();
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const handleEndRide = async (rideId) => {
    if (!confirm("End this ride?")) return;
    try {
      await API.put(`/driver/rides/${rideId}/end`);
      flash("Ride ended");
      setSelectedRide(null);
      await fetchRides();
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const handleFillSeat = async (rideId) => {
    try {
      const { data } = await API.put(`/driver/rides/${rideId}/fill-seat`);
      flash(data.message);
      await fetchRides();
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const handleUnfillSeat = async (rideId) => {
    try {
      const { data } = await API.put(`/driver/rides/${rideId}/unfill-seat`);
      flash(data.message);
      await fetchRides();
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const fetchRideBookings = async (rideId) => {
    try {
      const { data } = await API.get(`/driver/rides/${rideId}/bookings`);
      setBookings(data);
      setSelectedRide(rideId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = async (bookingId) => {
    try {
      await API.put(`/driver/bookings/${bookingId}/confirm`);
      flash("Confirmed");
      await fetchRideBookings(selectedRide);
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const handleNoShow = async (bookingId) => {
    if (!confirm("Mark as no-show?")) return;
    try {
      const { data } = await API.put(`/driver/bookings/${bookingId}/noshow`);
      flash(data.message);
      await fetchRideBookings(selectedRide);
      await fetchRides();
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const handleBlock = async (studentId) => {
    try {
      await API.post(`/driver/block/${studentId}`, { reason: "" });
      flash("Student blocked");
      await fetchBlocked();
      if (selectedRide) await fetchRideBookings(selectedRide);
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const handleUnblock = async (studentId) => {
    try {
      await API.delete(`/driver/block/${studentId}`);
      flash("Unblocked");
      await fetchBlocked();
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const statusLabel = {
    pending: "Pending",
    pending_confirmation: "Paid — Verify",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    no_show: "No Show",
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  const activeRide = rides.find((r) => r.status === "active");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 font-(--font-heading)">
        <i className="ri-steering-2-line mr-2 text-primary"></i>Driver Dashboard
      </h1>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-info/10 text-info flex items-center gap-2">
          <i className="ri-information-line"></i>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab("rides")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm cursor-pointer border-none transition-colors ${activeTab === "rides" ? "bg-primary text-auto-black" : "bg-white text-gray-600 hover:bg-gray-100"}`}
        >
          <i className="ri-road-map-line mr-1"></i>My Rides
        </button>
        <button
          onClick={() => setActiveTab("blocked")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm cursor-pointer border-none transition-colors ${activeTab === "blocked" ? "bg-primary text-auto-black" : "bg-white text-gray-600 hover:bg-gray-100"}`}
        >
          <i className="ri-forbid-line mr-1"></i>Blocked ({blocked.length})
        </button>
      </div>

      {activeTab === "rides" && (
        <div>
          {/* Create Ride */}
          {!activeRide && (
            <div className="mb-6">
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-primary hover:bg-primary-dark text-auto-black px-6 py-3 rounded-xl font-bold cursor-pointer border-none transition-colors"
                >
                  <i className="ri-add-line mr-1"></i>Create New Ride
                </button>
              ) : (
                <form
                  onSubmit={handleCreateRide}
                  className="bg-white rounded-2xl p-6 space-y-4"
                >
                  <h3 className="font-bold text-lg font-(--font-heading)">
                    Create Ride
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From*
                      </label>
                      <select
                        required
                        value={rideForm.from}
                        onChange={(e) =>
                          setRideForm({ ...rideForm, from: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary bg-white"
                      >
                        <option value="">Select pickup</option>
                        {LOCATIONS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To*
                      </label>
                      <select
                        required
                        value={rideForm.to}
                        onChange={(e) =>
                          setRideForm({ ...rideForm, to: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary bg-white"
                      >
                        <option value="">Select destination</option>
                        {LOCATIONS.filter((l) => l !== rideForm.from).map(
                          (l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Seats* (max 10)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="10"
                        value={rideForm.total_seats}
                        onChange={(e) =>
                          setRideForm({
                            ...rideForm,
                            total_seats: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departure Time
                      </label>
                      <input
                        type="time"
                        value={rideForm.departure_time}
                        onChange={(e) =>
                          setRideForm({
                            ...rideForm,
                            departure_time: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={rideForm.departure_date}
                        onChange={(e) =>
                          setRideForm({
                            ...rideForm,
                            departure_date: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-success hover:bg-success-dark text-white px-6 py-2.5 rounded-xl font-bold cursor-pointer border-none transition-colors"
                    >
                      <i className="ri-check-line mr-1"></i>Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-medium cursor-pointer border-none"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeRide && (
            <div className="bg-primary/10 border-2 border-primary rounded-2xl p-4 mb-4 text-sm">
              <i className="ri-information-line mr-1"></i>You have an active
              ride. End it before creating a new one.
            </div>
          )}

          {/* Rides list */}
          <div className="space-y-3">
            {rides.map((ride) => {
              const seatPercent = (ride.filled_seats / ride.total_seats) * 100;
              const isFull = ride.filled_seats >= ride.total_seats;
              return (
                <div key={ride._id} className="bg-white rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{ride.from}</span>
                      <i className="ri-arrow-right-line text-xl text-primary"></i>
                      <span className="font-bold text-lg">{ride.to}</span>
                    </div>
                    <span
                      className={`badge-${ride.status} px-3 py-1 rounded-lg text-xs font-bold`}
                    >
                      {ride.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Seat progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>
                        <i className="ri-group-line mr-1"></i>
                        {ride.filled_seats}/{ride.total_seats} seats
                      </span>
                      {(ride.departure_date || ride.departure_time) && (
                        <span className="text-xs text-gray-400">
                          {ride.departure_date && (
                            <>
                              <i className="ri-calendar-line mr-1"></i>
                              {ride.departure_date}
                            </>
                          )}
                          {ride.departure_time && (
                            <span className="ml-2">
                              <i className="ri-time-line mr-1"></i>
                              {ride.departure_time}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isFull ? "bg-error" : "bg-primary"}`}
                        style={{ width: `${seatPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => fetchRideBookings(ride._id)}
                      className="bg-info hover:bg-info-dark text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-none transition-colors"
                    >
                      <i className="ri-group-line mr-1"></i>Bookings
                    </button>

                    {/* Fill/Unfill seat buttons for active rides */}
                    {ride.status === "active" && (
                      <>
                        <button
                          onClick={() => handleFillSeat(ride._id)}
                          disabled={isFull}
                          className="bg-success hover:bg-success-dark text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <i className="ri-user-add-line mr-1"></i>Fill Seat
                          (Offline)
                        </button>
                        {ride.filled_seats > 0 && (
                          <button
                            onClick={() => handleUnfillSeat(ride._id)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-none transition-colors"
                          >
                            <i className="ri-user-unfollow-line mr-1"></i>Remove
                            Offline
                          </button>
                        )}
                        <button
                          onClick={() => handleEndRide(ride._id)}
                          className="bg-error hover:bg-error-dark text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-none transition-colors"
                        >
                          <i className="ri-stop-circle-line mr-1"></i>End Ride
                        </button>
                      </>
                    )}
                  </div>

                  {/* Bookings panel */}
                  {selectedRide === ride._id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-bold mb-3">Passengers</h4>
                      {bookings.length === 0 ? (
                        <p className="text-gray-500 text-sm">No bookings yet</p>
                      ) : (
                        <div className="space-y-2">
                          {bookings.map((b) => (
                            <div
                              key={b._id}
                              className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {b.student_id?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  <i className="ri-phone-line mr-1"></i>
                                  {b.student_id?.phone}
                                </p>
                                {b.student_id?.no_show_count > 0 && (
                                  <p className="text-xs text-error">
                                    ⚠️ {b.student_id.no_show_count} no-show(s)
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`badge-${b.status} px-2 py-1 rounded-lg text-xs font-bold`}
                                >
                                  {statusLabel[b.status]}
                                </span>
                                {b.status === "pending_confirmation" && (
                                  <button
                                    onClick={() => handleConfirm(b._id)}
                                    className="bg-success text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer border-none"
                                  >
                                    ✓ Confirm
                                  </button>
                                )}
                                {[
                                  "pending",
                                  "pending_confirmation",
                                  "confirmed",
                                ].includes(b.status) && (
                                  <>
                                    <button
                                      onClick={() => handleNoShow(b._id)}
                                      className="bg-error text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer border-none"
                                    >
                                      No Show
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleBlock(b.student_id?._id)
                                      }
                                      className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer border-none"
                                    >
                                      Block
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Blocked */}
      {activeTab === "blocked" && (
        <div>
          {blocked.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-gray-500">No blocked students</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blocked.map((b) => (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{b.student_id?.name}</p>
                    <p className="text-sm text-gray-500">
                      {b.student_id?.phone}
                    </p>
                    {b.reason && (
                      <p className="text-xs text-gray-400 mt-1">
                        Reason: {b.reason}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnblock(b.student_id?._id)}
                    className="bg-success text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer border-none hover:bg-success-dark transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
