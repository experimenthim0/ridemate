import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LOCATIONS } from "../constants/locations";
import API from "../api";
import Loader from "../components/Loader";

const StudentDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rides, setRides] = useState([]);
  const [activeTab, setActiveTab] = useState("rides");
  const [loading, setLoading] = useState(true);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [msg, setMsg] = useState("");

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

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchRides(), fetchBookings()]);
      setLoading(false);
    };
    load();
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

                    {/* Seat progress */}
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

                    {/* Driver */}
                    <div className="text-sm text-gray-600 mb-3 flex items-center justify-between">
                      <span>
                        <i className="ri-taxi-line mr-1 text-primary"></i>
                        {ride.driver_id?.name} — {ride.driver_id?.auto_number}
                      </span>
                      <span className="badge-active px-2 py-0.5 rounded-lg text-xs font-bold">
                        ACTIVE
                      </span>
                    </div>

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
    </div>
  );
};

export default StudentDashboard;
