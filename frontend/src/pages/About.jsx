import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-12 md:py-20 animate-fade-in relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-primary/10 to-transparent -z-10 rounded-b-[4rem]"></div>
      <div className="absolute top-20 right-10 w-64 h-64 bg-green-200/40 blur-3xl rounded-full -z-10 animate-pulse"></div>

      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100 mb-2">
            <img src="/icons8-auto-rickshaw-94.png" alt="Auto Rickshaw" className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight font-[var(--font-heading)]">
            About <span className="text-primary">RideMate</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The ultimate commuting solution built specifically for college students. Fast, safe, and economical auto seat booking and ride-sharing platform.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: Auto Seat Booking */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 group border border-gray-50">
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-all duration-300">
              <i className="ri-taxi-line"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-[var(--font-heading)]">Auto Seat Booking</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Skip the long queues. View available autos going from your location to campus or the city. Book just one seat or the whole auto instantly without any hassle.
            </p>
          </div>

          {/* Feature 2: Ride Requests */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 group border border-gray-50">
            <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-all duration-300">
              <i className="ri-hand text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-[var(--font-heading)]">Ride Requests</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Can't find an auto going to your destination? Simply post a ride request. Drivers nearby will see your request and can accept it to pick you up.
            </p>
          </div>

          {/* Feature 3: Ridesharing */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 group border border-gray-50">
            <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center text-2xl mb-6  transition-all duration-300">
              <i className="ri-group-line"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-[var(--font-heading)]">Rideshare (Student)</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Traveling alone and want to split the cost? Students can share their booked auto rides with others. Save money and make new friends on your commute!
            </p>
          </div>
        </div>

        {/* How it Works / CTA */}
        {/* <div className="bg-auto-black rounded-[2.5rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
           */}
          {/* <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 font-[var(--font-heading)]">Ready to transform your commute?</h2>
            <p className="text-gray-300 mb-8 text-lg">
              Join thousands of students and drivers making transportation smarter and safer on campus.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/student-register" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] active:scale-95">
                Join as Student
              </Link>
              <Link to="/driver-login" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-all border border-gray-700 active:scale-95">
                Driver Login
              </Link>
            </div>
          </div> 
           </div> */}
      </div>

      <Footer/>
    </div>
  );
};

export default About;
