import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LOCATIONS } from "../constants/locations";
import API from "../api";
import Loader from "../components/Loader";

const StudentDashboard = () => {
  const [rides, setRides] = useState([]);
  const [createdRides, setCreatedRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("rides");
  const [loading, setLoading] = useState(true);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [editingRideId, setEditingRideId] = useState(null);
  const [editForm, setEditForm] = useState({
    departure_time: "",
    departure_date: "",
  });
  const [msg, setMsg] = useState("");
  const [newRide, setNewRide] = useState({
    from: "",
    to: "",
    total_seats: 1,
    departure_time: "",
    departure_date: "",
  });

  const fetchRides = async () => {
    try {
      const params = new URLSearchParams();
      if (filterFrom) params.append("from", filterFrom);
      if (filterTo) params.append("to", filterTo);
      const { data } = await API.get(`/student/rides?${params.toString()}`);
      setRides(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await API.get("/student/bookings");
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCreatedRides = async () => {
    try {
      const { data } = await API.get("/student/rides/created");
      setCreatedRides(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRides(), fetchBookings(), fetchCreatedRides()]);
      setLoading(false);
    };
    init();
  }, []);

  const flash = (message) => {
    setMsg(message);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleBook = async (rideId) => {
    try {
      const { data } = await API.post(`/student/book/${rideId}`);
      flash(data.message);
      await Promise.all([fetchRides(), fetchBookings()]);
    } catch (err) {
      flash(err.response?.data?.message || "Booking failed");
    }
  };

  const handleMarkPaid = async (bookingId) => {
    try {
      const { data } = await API.put(`/student/book/${bookingId}/pay`);
      flash(data.message);
      await fetchBookings();
    } catch (err) {
      flash(err.response?.data?.message || "Failed");
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      const { data } = await API.put(`/student/book/${bookingId}/cancel`);
      flash(data.message);
      await Promise.all([fetchRides(), fetchBookings()]);
    } catch (err) {
      flash(err.response?.data?.message || "Cancel failed");
    }
  };

  const handleReport = async (rideId) => {
    if (!confirm("Report this as a fake ride? The creator may be banned."))
      return;
    try {
      const { data } = await API.post(`/student/ride/${rideId}/report`);
      flash(data.message);
      await fetchRides();
    } catch (err) {
      flash(err.response?.data?.message || "Report failed");
    }
  };

  const handleCreateRide = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/student/ride", newRide);
      flash(data.message);
      setNewRide({
        from: "",
        to: "",
        total_seats: 1,
        departure_time: "",
        departure_date: "",
      });
      await fetchRides();
      await fetchCreatedRides();
      setActiveTab("rides");
    } catch (err) {
      flash(err.response?.data?.message || "Failed to create ride");
    }
  };

  const handleEditRide = async (e, rideId) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/student/ride/${rideId}`, editForm);
      flash(data.message);
      setEditingRideId(null);
      await fetchCreatedRides();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to edit ride");
    }
  };

  const statusLabel = {
    pending: "Pending Payment",
    pending_confirmation: "Awaiting Confirmation",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    no_show: "No Show",
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 font-(--font-heading)">
        <i className="ri-dashboard-line mr-2 text-primary"></i>Student Dashboard
      </h1>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-info/10 text-info flex items-center gap-2">
          <i className="ri-information-line"></i>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("rides")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer border-none ${activeTab === "rides" ? "bg-primary text-auto-black" : "bg-white text-gray-600 hover:bg-gray-100"}`}
        >
          <i className="ri-road-map-line mr-1"></i>Active Rides
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer border-none ${activeTab === "bookings" ? "bg-primary text-auto-black" : "bg-white text-gray-600 hover:bg-gray-100"}`}
        >
          <i className="ri-ticket-line mr-1"></i>My Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("myRides")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer border-none ${activeTab === "myRides" ? "bg-primary text-auto-black" : "bg-white text-gray-600 hover:bg-gray-100"}`}
        >
          <i className="ri-car-share-line mr-1"></i>Share Ride
        </button>
      </div>

      {/* Active Rides */}
      {activeTab === "rides" && (
        <div>
          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <select
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
            >
              <option value="">From (All)</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
            >
              <option value="">To (All)</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <button
              onClick={fetchRides}
              className="bg-primary text-auto-black px-5 py-2.5 rounded-xl font-medium cursor-pointer border-none hover:bg-primary-dark transition-colors text-sm"
            >
              <i className="ri-search-line mr-1"></i>Search
            </button>
          </div>

          {rides.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="text-5xl mb-3">🛺</div>
              <p className="text-gray-500">No active rides available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rides.map((ride) => {
                const seatPercent =
                  (ride.filled_seats / ride.total_seats) * 100;
                const isFull = ride.filled_seats >= ride.total_seats;
                return (
                  <div key={ride._id} className="bg-white rounded-2xl p-5">
                    {/* From → To */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 uppercase">From</p>
                        <p className="font-bold">{ride.from}</p>
                      </div>
                      <i className="ri-arrow-right-line text-xl text-primary"></i>
                      <div className="flex-1 text-right">
                        <p className="text-xs text-gray-400 uppercase">To</p>
                        <p className="font-bold">{ride.to}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>
                          {ride.filled_seats}/{ride.total_seats} seats
                        </span>
                        {isFull && (
                          <span className="text-error font-bold text-xs">
                            FULL
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

                    {/* Booked By Me indicator */}
                    {bookings.some(
                      (b) =>
                        b.ride_id?._id === ride._id &&
                        [
                          "pending",
                          "pending_confirmation",
                          "confirmed",
                        ].includes(b.status),
                    ) && (
                      <div className="mb-2 w-fit px-2 py-0.5 rounded text-xs font-bold bg-success/20 text-success">
                        <i className="ri-check-line mr-1"></i>BOOKED
                      </div>
                    )}

                    {/* Driver or Student */}
                    {ride.type === "student_sharing" ? (
                      <div className="text-sm text-gray-600 mb-3 flex items-center justify-between">
                        <span>
                          <i className="ri-user-smile-line mr-1 text-primary"></i>
                          {ride.student_id?.name || "Student"}
                        </span>
                        <div className="flex gap-2 items-center">
                          <span className="bg-warning text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                            RIDESHARING
                          </span>
                          <button
                            onClick={() => handleReport(ride._id)}
                            className="text-error text-xs hover:underline cursor-pointer bg-transparent border-none p-0"
                            title="Report Fake Ride"
                          >
                            <i className="ri-alarm-warning-line"></i> Report
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 mb-3 flex items-center justify-between">
                        <span>
                          <i className="ri-taxi-line mr-1 text-primary"></i>
                          {ride.driver_id?.name} — {ride.driver_id?.auto_number}
                        </span>
                        <span className="badge-active px-2 py-0.5 rounded-lg text-xs font-bold">
                          ACTIVE
                        </span>
                      </div>
                    )}

                    {(ride.departure_time || ride.departure_date) && (
                      <div className="text-xs text-gray-400 mb-3">
                        {ride.departure_date && (
                          <span>
                            <i className="ri-calendar-line mr-1"></i>
                            {ride.departure_date}
                          </span>
                        )}
                        {ride.departure_time && (
                          <span className="ml-2">
                            <i className="ri-time-line mr-1"></i>
                            {ride.departure_time}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBook(ride._id)}
                        disabled={isFull}
                        className="flex-1 bg-primary hover:bg-primary-dark text-auto-black py-2.5 rounded-xl font-bold text-sm cursor-pointer border-none disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isFull ? "Full" : "🛺 Book"}
                      </button>
                      <Link
                        to={`/ride/${ride._id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium no-underline transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Bookings */}
      {activeTab === "bookings" && (
        <div>
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="text-5xl mb-3">🎫</div>
              <p className="text-gray-500">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{booking.ride_id?.from}</span>
                      <i className="ri-arrow-right-line text-primary"></i>
                      <span className="font-bold">{booking.ride_id?.to}</span>
                    </div>
                    <span
                      className={`badge-${booking.status} px-3 py-1 rounded-lg text-xs font-bold`}
                    >
                      {statusLabel[booking.status]}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mb-3">
                    <p>
                      <i className="ri-taxi-line mr-1"></i>
                      {booking.ride_id?.driver_id?.name} —{" "}
                      {booking.ride_id?.driver_id?.auto_number}
                    </p>
                    <p>
                      <i className="ri-time-line mr-1"></i>
                      {new Date(booking.booking_time).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {booking.status === "pending" && (
                      <>
                        <Link
                          to={`/ride/${booking.ride_id?._id}`}
                          className="bg-info hover:bg-info-dark text-white px-4 py-2 rounded-xl text-sm font-medium no-underline transition-colors"
                        >
                          <i className="ri-qr-code-line mr-1"></i>Pay via QR
                        </Link>
                        <button
                          onClick={() => handleMarkPaid(booking._id)}
                          className="bg-success hover:bg-success-dark text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-none transition-colors"
                        >
                          <i className="ri-check-line mr-1"></i>I Have Paid
                        </button>
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="bg-error hover:bg-error-dark text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-none transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {booking.status === "pending_confirmation" && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="bg-error hover:bg-error-dark text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-none transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Ride Form */}
      {activeTab === "myRides" && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 text-sm">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <i className="ri-alert-line"></i> Important Rules for Ride Sharing
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You can only create{" "}
                <strong className="font-bold">2 rides per day</strong>.
              </li>
              <li>Other students can report fake or false rides.</li>
              <li>
                If your ride is reported 3 times, you will be{" "}
                <strong className="font-bold">banned for 7 days</strong>.
              </li>
              <li>
                Repeated bans (3 times) will result in a{" "}
                <strong className="font-bold">permanent block</strong> from
                creating rides.
              </li>
            </ul>
          </div>

          <h2 className="text-xl font-bold mb-6 font-(--font-heading)">
            Share Your Auto
          </h2>
          <form onSubmit={handleCreateRide} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  From
                </label>
                <select
                  required
                  value={newRide.from}
                  onChange={(e) =>
                    setNewRide({ ...newRide, from: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white transition-all"
                >
                  <option value="">Select Pickup</option>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  To
                </label>
                <select
                  required
                  value={newRide.to}
                  onChange={(e) =>
                    setNewRide({ ...newRide, to: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white transition-all"
                >
                  <option value="">Select Destination</option>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Available Seats
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={newRide.total_seats}
                  onChange={(e) =>
                    setNewRide({ ...newRide, total_seats: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Departure Time (Optional)
                </label>
                <input
                  type="time"
                  value={newRide.departure_time}
                  onChange={(e) =>
                    setNewRide({ ...newRide, departure_time: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Departure Date (Optional)
                </label>
                <input
                  type="date"
                  value={newRide.departure_date}
                  onChange={(e) =>
                    setNewRide({ ...newRide, departure_date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-auto-black py-3.5 rounded-xl font-bold text-lg cursor-pointer border-none transition-colors mt-4"
            >
              <i className="ri-add-line mr-2"></i>Create Ride Share
            </button>
          </form>

          {/* List of Created Rides */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4 font-(--font-heading)">
              <i className="ri-history-line mr-2"></i>Your Shared Rides (Last 7)
            </h2>
            {createdRides.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500">
                  You haven't shared any rides yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {createdRides.map((r) => (
                  <div
                    key={r._id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{r.from}</span>
                        <i className="ri-arrow-right-line text-primary"></i>
                        <span className="font-bold">{r.to}</span>
                      </div>
                      <span
                        className={`badge-${r.status} px-2.5 py-1 rounded-lg text-xs font-bold`}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <i className="ri-group-line mr-1"></i>
                        {r.filled_seats}/{r.total_seats} slots
                      </div>
                      <div>
                        <i className="ri-time-line mr-1"></i>
                        {r.departure_time || "N/A"}
                      </div>
                      <div>
                        <i className="ri-calendar-line mr-1"></i>
                        {r.departure_date || "N/A"}
                      </div>
                      <div>
                        <i className="ri-information-line mr-1"></i>
                        {r.reports?.length || 0} Reports
                      </div>
                    </div>

                    {r.status === "active" && editingRideId !== r._id && (
                      <button
                        onClick={() => {
                          setEditingRideId(r._id);
                          setEditForm({
                            departure_time: r.departure_time || "",
                            departure_date: r.departure_date || "",
                          });
                        }}
                        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded-lg font-medium transition-colors cursor-pointer border-none"
                      >
                        Edit Time/Date
                      </button>
                    )}

                    {editingRideId === r._id && (
                      <form
                        onSubmit={(e) => handleEditRide(e, r._id)}
                        className="mt-3 bg-white p-3 rounded-lg border border-gray-200"
                      >
                        <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                          <div>
                            <label className="block text-gray-500 mb-1">
                              Time
                            </label>
                            <input
                              type="time"
                              value={editForm.departure_time}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  departure_time: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-200 rounded outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={editForm.departure_date}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  departure_date: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-200 rounded outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-primary text-auto-black py-1.5 rounded font-bold text-sm cursor-pointer border-none"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRideId(null)}
                            className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded font-bold text-sm cursor-pointer border-none"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
