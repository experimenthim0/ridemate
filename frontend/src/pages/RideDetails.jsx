import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import Loader from "../components/Loader";
import RideChat from "../components/RideChat";

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [ride, setRide] = useState(null);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [hasAccess, setHasAccess] = useState(false); // Determines chat access

  useEffect(() => {
    const fetchRide = async () => {
      try {
        // Use student authenticated endpoint if logged in as student (to get QR), else public
        if (user && role === "student") {
          const { data } = await API.get(`/student/ride/${id}`);
          setRide(data.ride);
          setQr(data.qr);
          setHasAccess(
            data.hasBooking ||
              data.ride.student_id?._id === user._id ||
              data.ride.driver_id?._id === user._id,
          );
        } else if (user && role === "driver") {
          const { data } = await API.get(`/rides/${id}`); 
          setRide(data.ride);
          setHasAccess(data.ride.driver_id?._id === user._id);
        } else {
          const { data } = await API.get(`/rides/${id}`);
          setRide(data.ride);
        }
      } catch (err) {
        setMsg(err.response?.data?.message || "Failed to load ride");
      }
      setLoading(false);
    };
    fetchRide();
  }, [id, user, role]);

  const handleBook = async () => {
    try {
      const { data } = await API.post(`/student/book/${id}`);
      setMsg(data.message);
      setTimeout(() => navigate("/student-dashboard"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Booking failed");
    }
  };

  const handleReport = async () => {
    if (!window.confirm("Report this as a fake ride? The creator may be banned."))
      return;
    try {
      const { data } = await API.post(`/student/ride/${id}/report`);
      setMsg(data.message);
    } catch (err) {
      setMsg(err.response?.data?.message || "Report failed");
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const timeString = ride.departure_time ? ` at ${ride.departure_time}` : "";
    const dateString = ride.departure_date ? ` on ${ride.departure_date}` : "";
    const shareText = `Check out this ride from ${ride.from} to ${ride.to}${dateString}${timeString}. Book your seat here:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my ride!",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed silently
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setMsg("Ride details copied to clipboard!");
        setTimeout(() => setMsg(""), 3000);
      } catch (err) {
        setMsg("Failed to copy link.");
      }
    }
  };

  if (loading) return <Loader text="Loading ride..." />;

  if (!ride) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🛺</div>
        <p className="text-gray-500 text-lg">{msg || "Ride not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-primary text-auto-black px-6 py-2.5 rounded-xl font-bold cursor-pointer border-none"
        >
          Go Back
        </button>
      </div>
    );
  }

  const seatPercent = (ride.filled_seats / ride.total_seats) * 100;
  const isFull = ride.filled_seats >= ride.total_seats;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer bg-transparent border-none flex items-center"
        >
          <i className="ri-arrow-left-line mr-1"></i>Back
        </button>
        
        {/* Share Button Added Here */}
        <button
          onClick={handleShare}
          className="text-yellow-500 hover:text-primary-dark font-medium text-sm cursor-pointer bg-transparent border-none flex items-center transition-colors"
        >
          <i className="ri-share-forward-line mr-1"></i>Share Ride
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-info/10 text-info">
          {msg}
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 mb-4">
        {/* From → To */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              From
            </p>
            <p className="text-2xl font-bold font-(--font-heading)">
              {ride.from}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <i className="ri-arrow-right-line text-3xl text-primary"></i>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">To</p>
            <p className="text-2xl font-bold font-(--font-heading)">
              {ride.to}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-500">
            <i className="ri-group-line mr-1"></i>
            {ride.filled_seats}/{ride.total_seats} seats
          </span>
          <span
            className={`badge-${ride.status} px-4 py-1 rounded-xl text-sm font-bold`}
          >
            {ride.status.toUpperCase()}
          </span>
        </div>

        {/* Seat Progress */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            className={`h-3 rounded-full transition-all ${isFull ? "bg-error" : "bg-primary"}`}
            style={{ width: `${seatPercent}%` }}
          ></div>
        </div>

        {/* Time/Date */}
        {(ride.departure_time || ride.departure_date) && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-600">
            {ride.departure_date && (
              <span>
                <i className="ri-calendar-line mr-1 text-primary"></i>
                {ride.departure_date}
              </span>
            )}
            {ride.departure_time && (
              <span className="ml-4">
                <i className="ri-time-line mr-1 text-primary"></i>
                {ride.departure_time}
              </span>
            )}
          </div>
        )}

        {/* Driver or Student Info */}
        {ride.type === "student_sharing" && ride.student_id ? (
          <div className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
            <h3 className="font-bold mb-2 flex justify-between items-center text-yellow-800">
              <span>
                <i className="ri-user-smile-line text-warning mr-1"></i>Student
                (Ride Share)
              </span>
              <span className="bg-warning text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                RIDESHARING
              </span>
            </h3>
            <p className="text-sm text-yellow-900">
              <strong>Name:</strong> {ride.student_id.name}
            </p>
            {ride.student_id.phone && (
              <p className="text-sm text-yellow-900">
                <strong>Phone:</strong> {ride.student_id.phone}
              </p>
            )}
            {ride.student_id.email && (
              <p className="text-sm text-yellow-900">
                <strong>Email:</strong> {ride.student_id.email}
              </p>
            )}
          </div>
        ) : ride.driver_id ? (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold mb-2">
              <i className="ri-taxi-line text-primary mr-1"></i>Driver
            </h3>
            <p className="text-sm">
              <strong>Name:</strong> {ride.driver_id.name}
            </p>
            <p className="text-sm">
              <strong>Auto:</strong> {ride.driver_id.auto_number}
            </p>
            <p className="text-sm">
              <strong>Phone:</strong> {ride.driver_id.phone}
            </p>
          </div>
        ) : null}

        {/* QR Code */}
        {qr && ride.status === "active" && (
          <div className="bg-primary/10 rounded-xl p-6 text-center mb-6">
            <h3 className="font-bold mb-3">
              <i className="ri-qr-code-line mr-1"></i>Pay via UPI
            </h3>
            <img
              src={qr.qrDataUrl}
              alt="UPI QR Code"
              className="mx-auto rounded-xl mb-3"
              style={{ width: 200 }}
            />
            <p className="text-sm text-gray-600 mb-1">
              Scan with Google Pay, PhonePe, or Paytm
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {user && role === "student" && ride.status === "active" && !isFull && (
          <button
            onClick={handleBook}
            className="w-full bg-primary hover:bg-primary-dark text-auto-black py-3.5 rounded-xl font-bold text-lg cursor-pointer border-none transition-colors"
          >
            🛺 Book This Ride
          </button>
        )}

        {user &&
          role === "student" &&
          ride.status === "active" &&
          ride.type === "student_sharing" && (
            <button
              onClick={handleReport}
              className="w-full bg-red-100 hover:bg-red-200 text-error py-3.5 rounded-xl font-bold text-lg cursor-pointer border-none transition-colors mt-3"
            >
              <i className="ri-alarm-warning-line mr-2"></i>Report Fake Ride
            </button>
          )}

        {isFull && ride.status === "active" && (
          <div className="text-center py-3 bg-error/10 text-error rounded-xl font-bold">
            All seats filled
          </div>
        )}

        {!user && ride.status === "active" && (
          <a
            href="/student-login"
            className="block text-center py-3 bg-gray-100 text-gray-600 rounded-xl font-bold no-underline hover:bg-gray-200"
          >
            <i className="ri-lock-line mr-1"></i>Login to Book
          </a>
        )}
      </div>

      {/* Render Chat Component using the hasAccess state! */}
       <RideChat rideId={ride._id} currentUserId={user?._id} canChat={hasAccess} />
    </div>
  );
};

export default RideDetails;