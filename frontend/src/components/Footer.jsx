import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api";

const Footer = () => {
  const [stats, setStats] = useState({ totalUsers: 0, liveStudents: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/public-stats");
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch public stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <footer className="bg-auto-black text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">
                <img
                  src="/icons8-auto-rickshaw-94.png"
                  alt=""
                  className="w-14 h-14"
                />
              </span>
              <span className="text-xl font-bold text-primary font-[var(--font-heading)]">
                Ride<span className="text-white">Mate</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Auto Seat Booking Platform for NITJ. Connecting students with
              approved auto drivers for safe and convenient rides.
            </p>
            <div className="flex gap-4">
              <div className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Total Users
                </p>
                <p className="text-white font-bold text-lg">
                  {stats.totalUsers}+
                </p>
              </div>
              <div className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  Live Students
                </p>
                <p className="text-green-500 font-bold text-lg">
                  {stats.liveStudents}+
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 font-[var(--font-heading)]">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              <Link
                to="/privacy-policy"
                className="text-gray-400 hover:text-primary transition-colors text-sm no-underline"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-conditions"
                className="text-gray-400 hover:text-primary transition-colors text-sm no-underline"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/driver-consent"
                className="text-gray-400 hover:text-primary transition-colors text-sm no-underline"
              >
                Driver Consent
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 font-[var(--font-heading)]">
              Contact
            </h4>
            <p className="text-sm">
              <i className="ri-mail-line mr-2"></i>contact.nikhim@gmail.com
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-4">
          <p className="text-xs text-center text-gray-500">
            ⚠️ Disclaimer: This platform only facilitates seat coordination.
            Travel responsibility lies between driver and passenger.
          </p>
          <p className="text-xs text-center text-gray-500 mt-2">
            &copy; {new Date().getFullYear()} RideMate | Developed By{" "}
            <span className="text-white font-semibold underline">
              <a href="https://nikhim.me" target="_blank">
                Nikhil
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
