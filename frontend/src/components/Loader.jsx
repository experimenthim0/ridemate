import { useState, useEffect } from "react";

// Funny Hindi-English college auto lines 😂
const FUNNY_TEXTS = [
  "Auto wala bhaiya speed mein aa rahe hain... 🚀",
  "Bhai seat bach gayi toh kismat samajh... 😅",
  "College se station tak ka safar, auto mein 10 log, 3 seats 🤡",
  "Auto mein 4 jagah hai, baith jao 8 log... 🪄",
  '"Bhaiya thoda aage se le lena" — Har student ever 🙏',
  "Jyoti Chowk tak ₹10... Maqsudan tak ₹15... Chandni Chowk tak sapna 💭",
  'Auto wala: "Chal beta jaldi baith"\nStudent: "Bhaiya meter se chalega?" 😂',
  "3 seats, 7 students, 1 auto — Ye toh magic show hai 🎩",
  "College auto mein AC nahi hai, lekin vibes premium hai 😎",
  '"Bhaiya College chaloge?" — "Haan baith, ₹10 extra" 💀',
  "Late ho gye? Auto nahi mili? Welcome to college life 🎓",
  "Rickshaw wale bhaiya se zyada jugaad koi nahi jaanta 🧠",
  "Auto seat booking mein bhi competition hai... NITJ hai bhai 🔥",
  '"Ek aur aa jayega" — Auto driver\'s famous last words 🗣️',
  "Loading ho raha hai... jaise auto subah 8 baje aata hai ⏰",
  "College ke auto mein WiFi nahi milta, lekin memories milti hain ❤️",
  "Sem exam se pehle auto dhundhna — real survival test 📝",
  "Auto wale bhaiya ka shortcut > Google Maps 🗺️",
  "PAP Chowk se College — Journey nahi, adventure hai 🏔️",
  '"Bhaiya last wali seat meri hai" — Booking wars 2026 ⚔️',
  "Auto mein baithke padhai karne wale — respect 📚",
  "Rama Mandi se College, 15 min mein... (terms & conditions apply) 😏",
  "Station se College auto mein — sapne dekhne ka time 😴",
  "Hostel ka khana miss karna > Auto miss karna 🍛",
  "Auto sharing = Forced social networking 🤝",
  "Bus Stand se College, 6 sawari, 3 seat — Tetris real life edition 🧩",
];

const Loader = ({ text, fullscreen = false }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(() =>
    Math.floor(Math.random() * FUNNY_TEXTS.length),
  );
  const [isExiting, setIsExiting] = useState(false);
  const [smokeParticles, setSmokeParticles] = useState([]);

  // Rotate funny texts every 3 seconds with animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentTextIndex((prev) => {
          let next;
          do {
            next = Math.floor(Math.random() * FUNNY_TEXTS.length);
          } while (next === prev && FUNNY_TEXTS.length > 1);
          return next;
        });
        setIsExiting(false);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Generate smoke particles
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      setSmokeParticles((prev) => [...prev.slice(-5), id]);
      setTimeout(() => {
        setSmokeParticles((prev) => prev.filter((p) => p !== id));
      }, 1200);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const containerClass = fullscreen
    ? "fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center px-4 select-none"
    : "min-h-[400px] flex flex-col items-center justify-center px-4 py-8 select-none";

  return (
    <div className={containerClass}>
      {/* RideMate branding — only in fullscreen */}
      {fullscreen && (
        <div className="flex items-center gap-3 mb-8 animate-pulse">
          <img
            src="/icons8-auto-rickshaw-94.png"
            alt=""
            className="w-12 h-12"
          />
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span style={{ color: "#fbbf24" }}>Ride</span>
            <span style={{ color: "#1c1917" }}>Mate</span>
          </span>
        </div>
      )}
      {/* Road Scene */}
      <div className="relative w-full max-w-md h-28 overflow-hidden mb-2">
        {/* Sky gradient */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              "linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 60%, #fef3c7 100%)",
          }}
        ></div>

        {/* Sun */}
        <div className="loader-sun"></div>

        {/* Clouds */}
        <div className="loader-cloud loader-cloud-1"></div>
        <div className="loader-cloud loader-cloud-2"></div>

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-700 rounded-b-2xl">
          {/* Road center line (dashes) */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex gap-3 loader-road-lines">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-1 bg-yellow-400 rounded-full shrink-0"
              ></div>
            ))}
          </div>
        </div>

        {/* Auto Rickshaw */}
        <div className="loader-auto">
          <img
            src="/icons8-auto-rickshaw-94.png"
            alt="Auto Rickshaw"
            className="w-14 h-14 drop-shadow-lg"
            style={{ imageRendering: "auto" }}
          />
          {/* Smoke from exhaust */}
          {smokeParticles.map((id) => (
            <div key={id} className="loader-smoke"></div>
          ))}
        </div>

        {/* Trees/buildings passing by */}
        <div className="loader-scenery">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="shrink-0" style={{ marginRight: "60px" }}>
              <div
                className="w-3 bg-green-600 rounded-t-full mx-auto"
                style={{ height: `${20 + (i % 3) * 8}px` }}
              ></div>
              <div className="w-1 h-3 bg-amber-700 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Bouncing dots */}
      <div className="flex gap-1.5 mb-4 mt-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: i % 2 === 0 ? "#fbbf24" : "#374151",
              animation: `loaderBounce 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
            }}
          ></div>
        ))}
      </div>

      {/* Funny text with fade transition */}
      <div
        className="text-center max-w-sm mx-auto min-h-[60px] flex items-center justify-center"
        style={{
          transition: "opacity 0.4s, transform 0.4s",
          opacity: isExiting ? 0 : 1,
          transform: isExiting ? "translateY(10px)" : "translateY(0)",
        }}
      >
        <p
          className="text-gray-600 font-medium text-sm leading-relaxed whitespace-pre-line"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {FUNNY_TEXTS[currentTextIndex]}
        </p>
      </div>

      {/* Optional custom text below */}
      {text && (
        <p
          className="text-gray-400 text-xs mt-3 tracking-wide uppercase"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
