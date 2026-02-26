import { Link } from "react-router-dom";

const NotFound = () => {

  const hindiLines = [
    "Arre bhai, rasta bhatak gaye kya?",
    "Lagta hai galat gali mein aa gaye!",
    "Driver ne wrong turn le liya!",
    "Yeh route Google Map pe bhi nahi milega!",
    "Auto seedha khaali plot mein ghus gaya!"
  ];

  const englishLines = [
    "This page does not exist.",
    "The route you followed is invalid.",
    "Looks like this destination was removed.",
    "We couldn’t find this page anywhere.",
    "Even the driver is confused."
  ];

  const buttonTexts = [
    "Go Back Home (Ghar Chalo)",
    "Take Me Home",
    "Return to Safety",
    "Chalo Wapas",
    "Start New Ride"
  ];

  // Random selection
  const randomHindi = hindiLines[Math.floor(Math.random() * hindiLines.length)];
  const randomEnglish = englishLines[Math.floor(Math.random() * englishLines.length)];
  const randomButton = buttonTexts[Math.floor(Math.random() * buttonTexts.length)];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">

      <h1 className="text-8xl md:text-9xl font-black text-primary mb-4 drop-shadow-[4px_4px_0_#0D0D0D]">
        404
      </h1>

      <h2 className="text-2xl md:text-3xl font-bold mb-6">
        Oops! Looks like you took a wrong turn.
        <br />
        <span className="text-gray-600 font-medium text-lg mt-2 block">
          {randomHindi}
        </span>
      </h2>

      <p className="text-gray-600 mb-8 max-w-md">
        {randomEnglish}
      </p>

      <Link
        to="/"
        className="bg-primary hover:bg-primary-dark text-auto-black px-8 py-3 rounded-xl font-bold border-2 border-black shadow-[4px_4px_0_#0D0D0D] hover:shadow-[2px_2px_0_#0D0D0D] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        {randomButton}
      </Link>

    </div>
  );
};

export default NotFound;