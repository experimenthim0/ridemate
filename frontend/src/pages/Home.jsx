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
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides();
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
    "Please wait while drivers connect."
  ];

  

  const randomLine =
    Lines[Math.floor(Math.random() * Lines.length)];

 


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

        {/* Driver Info */}
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
        {user && role === "student" ? (
          <Link
            to={`/ride/${ride._id}`}
            className={`block text-center py-2.5 rounded-xl font-bold text-sm no-underline transition-colors ${isFull ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-dark text-auto-black cursor-pointer"}`}
          >
            {isFull ? "Full" : "🛺 Book Seat"}
          </Link>
        ) : !user ? (
          <Link
            to="/student-login"
            className="block text-center py-2.5 rounded-xl font-bold text-sm no-underline bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <i className="ri-lock-line mr-1"></i>Login to Book
          </Link>
        ) : null}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-auto-black text-white py-16 relative overflow-hidden">
        {/* <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🛺</div>
          <div className="absolute bottom-10 right-10 text-9xl transform -scale-x-100">
            🛺
          </div>
        </div> */}
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="mb-3 flex justify-center items-center"><img src="/icons8-auto-rickshaw-94.png" alt="" className="w-30 h-30"/></div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 font-(--font-heading)">
            <span className="text-primary">Ride</span>Mate
          </h1>
          <p className="text-lg text-gray-300 mb-6 max-w-xl mx-auto">
            Auto Seat Booking Platform For NITJ — Book your seat in college approved
            autos.
          </p>

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
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <select
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-lg text-gray-800 outline-none border border-gray-200 text-sm bg-white"
              >
                <option value="">To (All)</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
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

      {/* Features (only when not logged in) */}
      {!user && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 font-(--font-heading)">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
           <img width="64" height="64" src="https://img.icons8.com/glyph-neue/64/point-objects.png" alt="point-objects"/>
                </div>
                <h3 className="text-lg font-bold mb-2">Find a Ride</h3>
                <p className="text-gray-500 text-sm">
                  Search for active rides by pickup and destination.
                </p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img width="48" height="48" src="https://img.icons8.com/color-glass/48/booking.png" alt="booking"/>
                </div>
                <h3 className="text-lg font-bold mb-2">Book Your Seat</h3>
                <p className="text-gray-500 text-sm">
                  Reserve your seat instantly. Pay via UPI to the driver.
                </p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/map-marker.png" alt="map-marker"/>
                </div>
                <h3 className="text-lg font-bold mb-2">Enjoy the Ride</h3>
                <p className="text-gray-500 text-sm">
                  Travel with college-approved auto drivers. Simple!
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Active Rides */}
      <section className="py-15 max-w-7xl mx-auto mb-5 px-4">
        {loading ? (
          <Loader text="Finding rides..." />
        ) : rides.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="flex justify-center items-center mb-4"><img src="/icons8-auto-rickshaw-94.png" alt="" /></div>
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

      <section className="mb-10">
        <Authorised />
      </section>
    </div>
  );
};

export default Home;
