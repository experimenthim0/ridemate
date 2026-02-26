import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LOCATIONS } from "../constants/locations";
import API from "../api";
import axios from "axios";
import Loader from "../components/Loader";
import Authorised from "./Authorised";

const Home = () => {
  const { user, role } = useAuth();
  const [rides, setRides] = useState([]);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [myBookings, setMyBookings] = useState([]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      // Public endpoint — no auth needed
      const { data } = await API.get("/rides/active", {
        params: { from: filterFrom, to: filterTo },
      });
      setRides(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRides();

    // Fetch bookings if user is a student to show "Booked" status
    if (user && role === "student") {
      const fetchBookings = async () => {
        try {
          const { data } = await API.get("/student/bookings");
          setMyBookings(data || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchBookings();
    }
  }, [user, role]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides();
  };

  const handleReport = async (rideId) => {
    if (!confirm("Report this as a fake ride? The creator may be banned."))
      return;
    try {
      const { data } = await API.post(`/student/ride/${rideId}/report`);
      alert(data.message);
      fetchRides();
    } catch (err) {
      alert(err.response?.data?.message || "Report failed");
    }
  };

  const Lines = [
    "Abhi koi auto available nahi hai bhai!",
    "No autos nearby at the moment.",
    "No active rides available right now.",
    "Thoda ruk jao, auto aa hi raha hoga.",
    "All drivers are currently busy.",
    "Aaj auto strike pe hain shayad!",
    "Looks like everything is booked.",
    "Lagta h saare drivers chai ☕ peene gaye ",
    "Waiting for drivers to come online.",

    "Try refreshing the page.",
    "New rides appear every few minutes.",
    "Stay tuned 🚕",
    "Lagta hai sabhi rides already booked hain!",
    "Please wait while drivers connect.",
  ];

  const randomLine = Lines[Math.floor(Math.random() * Lines.length)];

  // Separate rides to/from college
  const toCollegeRides = rides.filter((r) => r.to === "College");
  const otherRides = rides.filter((r) => r.to !== "College");

  const RideCard = ({ ride }) => {
    const seatPercent = (ride.filled_seats / ride.total_seats) * 100;
    const isFull = ride.filled_seats >= ride.total_seats;
    const seatIcons = [];
    for (let i = 0; i < ride.total_seats; i++) {
      seatIcons.push(
        <i
          key={i}
          className={`ri-user-fill text-lg ${i < ride.filled_seats ? "text-primary" : "text-gray-300"}`}
        ></i>,
      );
    }

    return (
      <div className="bg-white rounded-2xl p-5 hover:ring-2 hover:ring-primary transition-all">
        {/* From → To */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              From
            </p>
            <p className="font-bold text-base">{ride.from}</p>
          </div>
          <div className="flex flex-col items-center px-2">
            <i className="ri-arrow-right-line text-xl text-primary"></i>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide">To</p>
            <p className="font-bold text-base">{ride.to}</p>
          </div>
        </div>

        {/* Seat Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm text-gray-500">
              <i className="ri-group-line mr-1"></i>
              {ride.filled_seats}/{ride.total_seats} seats
            </span>
            {isFull && (
              <span className="text-xs font-bold text-error">FULL</span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${isFull ? "bg-error" : "bg-primary"}`}
              style={{ width: `${seatPercent}%` }}
            ></div>
          </div>
          <div className="flex gap-0.5 mt-2">{seatIcons}</div>
        </div>

        {/* Booked By Me indicator */}
        {myBookings.some(
          (b) =>
            b.ride_id?._id === ride._id &&
            ["pending", "pending_confirmation", "confirmed"].includes(b.status),
        ) && (
          <div className="mb-2 w-fit px-2 py-0.5 rounded text-xs font-bold bg-success/20 text-success">
            <i className="ri-check-line mr-1"></i>BOOKED
          </div>
        )}

        {/* Driver or Student Info */}
        {ride.type === "student_sharing" ? (
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3 pt-3 border-t border-gray-100">
            <div>
              <span className="font-medium">
                {ride.student_id?.name || "Student"}
              </span>
              <span className="text-gray-400 ml-2">Student</span>
            </div>
            <span className="bg-warning text-white px-2.5 py-1 rounded-lg text-xs font-bold">
              RIDESHARING
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3 pt-3 border-t border-gray-100">
            <div>
              <span className="font-medium">{ride.driver_id?.name}</span>
              <span className="text-gray-400 ml-2">
                {ride.driver_id?.auto_number}
              </span>
            </div>
            <span className="badge-active px-2.5 py-1 rounded-lg text-xs font-bold">
              ACTIVE
            </span>
          </div>
        )}

        {/* Time/Date */}
        {(ride.departure_time || ride.departure_date) && (
          <div className="text-xs text-gray-400 mb-3">
            {ride.departure_date && (
              <span>
                <i className="ri-calendar-line mr-1"></i>
                {ride.departure_date}
              </span>
            )}
            {ride.departure_time && (
              <span className="ml-3">
                <i className="ri-time-line mr-1"></i>
                {ride.departure_time}
              </span>
            )}
          </div>
        )}

        {/* Book Button */}
        <div className="flex gap-2">
          {user && role === "student" ? (
            <>
              {ride.type === "student_sharing" && (
                <button
                  onClick={() => handleReport(ride._id)}
                  className="bg-red-100 hover:bg-red-200 text-error px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer border-none transition-colors"
                  title="Report Fake Ride"
                >
                  <i className="ri-alarm-warning-line"></i>
                </button>
              )}
              <Link
                to={`/ride/${ride._id}`}
                className={`flex-1 block text-center py-2.5 rounded-xl font-bold text-sm no-underline transition-colors ${isFull ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-dark text-auto-black cursor-pointer"}`}
              >
                {isFull ? "Full" : "🛺 Book Seat"}
              </Link>
            </>
          ) : !user ? (
            <Link
              to="/student-login"
              className="flex-1 block text-center py-2.5 rounded-xl font-bold text-sm no-underline bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <i className="ri-lock-line mr-1"></i>Login to Book
            </Link>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
     {/* ============================================================
   SECTION 1 — HERO SECTION (replace existing <section> hero)
   Includes: Feature announcements inline in hero banner
   ============================================================ */}

<section className="bg-auto-black text-white py-16 relative overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
    <div className="mb-3 flex justify-center items-center">
      <img src="/icons8-auto-rickshaw-94.png" alt="" className="w-30 h-30" />
    </div>
    <h1 className="text-4xl md:text-5xl font-extrabold mb-3 font-(--font-heading)">
      <span className="text-primary">Ride</span>Mate
    </h1>
    <p className="text-lg text-gray-300 mb-4 max-w-xl mx-auto">
      Auto Seat Booking Platform For NITJ — Book your seat in college approved autos.
    </p>

    {/* Feature Highlight Banner */}
    {/* <div className="mb-6 p-4 bg-yellow-500/20 text-yellow-200 rounded-xl border border-yellow-500/30 text-sm max-w-2xl mx-auto text-left space-y-3">
      <h3 className="font-bold flex items-center gap-2 text-base text-yellow-100">
        <i className="ri-sparkling-line"></i> What's New on RideMate
      </h3>

      <div className="flex gap-3 items-start">
        <span className="text-xl">🛺</span>
        <div>
          <p className="font-semibold text-yellow-100">Student Ride Sharing</p>
          <p className="text-yellow-200/80">Students can create up to 2 ride-shares per day from their dashboard. Rides are visible to everyone — your name and contact are shown to booked ridemates.</p>
        </div>
      </div>

      <div className="flex gap-3 items-start">
        <span className="text-xl">💬</span>
        <div>
          <p className="font-semibold text-yellow-100">Live Chat with Ridemates</p>
          <p className="text-yellow-200/80">Once booked, chat live with your fellow riders &amp; the ride creator. Only text &amp; emojis allowed. Messages auto-delete after 3 hours for privacy.</p>
        </div>
      </div>

      <div className="flex gap-3 items-start">
        <span className="text-xl">🚨</span>
        <div>
          <p className="font-semibold text-yellow-100">Fake Ride Reporting &amp; Auto-Ban</p>
          <p className="text-yellow-200/80">If 2–3 students mark a ride as fake, the creator is banned from posting for 7 days. Repeated abuse (2–3 times/month) leads to a permanent block.</p>
        </div>
      </div>

      <div className="flex gap-3 items-start">
        <span className="text-xl">✏️</span>
        <div>
          <p className="font-semibold text-yellow-100">Update Your Ride (Like a Real Driver)</p>
          <p className="text-yellow-200/80">Ride creators can update departure time, seats, or cancel the ride anytime — just like a driver managing their trip.</p>
        </div>
      </div>
    </div> */}

    {/* Search Filter */}
    <form onSubmit={handleSearch} className="max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white rounded-xl p-2">
        <select
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-lg text-gray-800 outline-none border border-gray-200 text-sm bg-white"
        >
          <option value="">From (All)</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <select
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-lg text-gray-800 outline-none border border-gray-200 text-sm bg-white"
        >
          <option value="">To (All)</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-auto-black px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer border-none"
        >
          <i className="ri-search-line mr-1"></i>Search
        </button>
      </div>
    </form>

    {!user && (
      <div className="flex items-center justify-center gap-4 flex-wrap mt-8">
        <Link
          to="/student-register"
          className="bg-primary hover:bg-primary-dark text-auto-black px-8 py-3 rounded-xl font-semibold text-lg transition-colors no-underline inline-flex items-center gap-2"
        >
          <i className="ri-user-add-line"></i> Register as Student
        </Link>
        <Link
          to="/student-login"
          className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors no-underline border border-white/20 inline-flex items-center gap-2"
        >
          <i className="ri-login-box-line"></i> Login
        </Link>
      </div>
    )}
  </div>
</section>

      

      {/* Active Rides */}
      <section className="py-15 max-w-7xl mx-auto mb-5 px-4">
        {loading ? (
          <Loader text="Finding rides..." />
        ) : rides.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="flex justify-center items-center mb-4">
              <img src="/icons8-auto-rickshaw-94.png" alt="" />
            </div>
            <p className="text-gray-700 text-lg font-semibold font-(--font-heading)">
              {randomLine}
            </p>
            <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <>
            {/* To College Section */}
            {toCollegeRides.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 font-(--font-heading) flex items-center gap-2">
                  <span className="bg-success text-white px-3 py-1 rounded-lg text-sm">
                    🎓 To College
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {toCollegeRides.map((ride) => (
                    <RideCard key={ride._id} ride={ride} />
                  ))}
                </div>
              </div>
            )}

            {/* Other Rides */}
            {otherRides.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 font-(--font-heading) flex items-center gap-2">
                  <i className="ri-road-map-line text-primary"></i>
                  {toCollegeRides.length > 0 ? "Other Rides" : "Active Rides"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherRides.map((ride) => (
                    <RideCard key={ride._id} ride={ride} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

{/* Features (only when not logged in) */}
     
  <section className="py-14 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-2 font-(--font-heading)">
        How It Works
      </h2>
      <p className="text-center text-gray-400 text-sm mb-10">Everything you need for safe, easy campus travel</p>

      {/* Core Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        <div className="text-center p-6 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img width="64" height="64" src="https://img.icons8.com/glyph-neue/64/point-objects.png" alt="Find" />
          </div>
          <h3 className="text-lg font-bold mb-2">Find a Ride</h3>
          <p className="text-gray-500 text-sm">Search by pickup and destination. See auto rides and student-shared rides together.</p>
        </div>
        <div className="text-center p-6 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img width="48" height="48" src="https://img.icons8.com/color-glass/48/booking.png" alt="Book" />
          </div>
          <h3 className="text-lg font-bold mb-2">Book Your Seat</h3>
          <p className="text-gray-500 text-sm">Reserve instantly. Pay via UPI to the driver or ride creator on arrival.</p>
        </div>
        <div className="text-center p-6 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/map-marker.png" alt="Ride" />
          </div>
          <h3 className="text-lg font-bold mb-2">Enjoy the Ride</h3>
          <p className="text-gray-500 text-sm">Travel with verified college autos or trusted student ridemates. Simple!</p>
        </div>
      </div>

      {/* Feature Cards */}
      <h2 className="text-2xl font-bold text-center mb-8 font-(--font-heading)">
        Platform Features
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Ridesharing */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <div className="text-3xl mb-3">🛺</div>
          <h3 className="font-bold text-gray-800 mb-1">Student Ridesharing</h3>
          <p className="text-gray-500 text-sm">Students can create up to 2 rides per day. Your name is shown on the ride card. Booked students see your phone/email in ride details.</p>
          <span className="inline-block mt-3 text-xs font-bold bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-lg">Max 2/day</span>
        </div>

        {/* Live Chat */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="font-bold text-gray-800 mb-1">Live Ride Chat</h3>
          <p className="text-gray-500 text-sm">Booked students and the ride creator can chat in real time. Only text and emojis. Messages auto-expire in 3 hours.</p>
          <span className="inline-block mt-3 text-xs font-bold bg-blue-400 text-white px-2.5 py-1 rounded-lg">Booked riders only</span>
        </div>

        {/* Report */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="text-3xl mb-3">🚨</div>
          <h3 className="font-bold text-gray-800 mb-1">Fake Ride Reports</h3>
          <p className="text-gray-500 text-sm">2–3 reports on a ride = 7-day posting ban. Repeated abuse (2–3 bans/month) = permanent block. Keeps the platform safe.</p>
          <span className="inline-block mt-3 text-xs font-bold bg-red-400 text-white px-2.5 py-1 rounded-lg">Auto-moderation</span>
        </div>

        {/* Update Ride */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="text-3xl mb-3">✏️</div>
          <h3 className="font-bold text-gray-800 mb-1">Manage Your Ride</h3>
          <p className="text-gray-500 text-sm">Edit departure time, seat count, or cancel your posted ride — just like a driver managing a trip in real time.</p>
          <span className="inline-block mt-3 text-xs font-bold bg-green-500 text-white px-2.5 py-1 rounded-lg">Creator controls</span>
        </div>

      </div>
    </div>
  </section>


      <section className="mb-10">
        <Authorised />
      </section>
    </div>
  );
};

export default Home;
