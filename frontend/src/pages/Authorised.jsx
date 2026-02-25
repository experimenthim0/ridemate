import React from "react";

function Authorised() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div class="w-full max-w-4xl">
        <div class="bg-yellow-400 rounded-t-2xl px-8 py-5 flex items-center justify-between border-b-4 border-green-600 shadow-[0_4px_0_#166534]">
          <div>
            <p class=" text-black text-xl font-bold tracking-widest capitalize mb-1">
              College Authorised Auto-Rickshaw Drivers
            </p>
            <h1 class="table-title text-black text-3xl font-bold leading-tight"></h1>
          </div>
          <div class="bg-black rounded-xl px-4 py-2 text-center">
            <p class="text-yellow-400 text-xs font-semibold tracking-widest">
              LOCATION
            </p>
            <p class="text-white text-sm font-bold leading-snug mt-1">
              Inside campus/
              <br />
              near Main Gate
            </p>
          </div>
        </div>

        <div class="overflow-hidden rounded-b-2xl shadow-2xl border border-gray-700">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="bg-green-700">
                <th class="header-cell text-white text-center py-3 px-4 font-bold text-xs uppercase tracking-widest w-14">
                  Sr.
                </th>
                <th class="header-cell text-white text-left py-3 px-5 font-bold text-xs uppercase tracking-widest">
                  Name of Driver
                </th>
                <th class="header-cell text-white text-center py-3 px-4 font-bold text-xs uppercase tracking-widest">
                  Vehicle No.
                </th>
                <th class="header-cell text-white text-center py-3 px-4 font-bold text-xs uppercase tracking-widest">
                  Mobile No.
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center py-3 px-4 bg-gray-800 text-gray-400 font-semibold">
                  1.
                </td>
                <td class="py-3 px-5 bg-gray-800 text-white font-medium">
                  Mr. Buta Ram
                </td>
                <td class="text-center py-3 px-4 bg-gray-800">
                  <span class="badge text-yellow-400 bg-black px-3 py-1 rounded-md text-xs">
                    PB08FL5461
                  </span>
                </td>
                <td class="text-center py-3 px-4 bg-gray-800 text-green-400 font-semibold tracking-wide">
                  8427947664
                </td>
              </tr>
              <tr>
                <td class="text-center py-3 px-4 bg-gray-900 text-gray-400 font-semibold">
                  2.
                </td>
                <td class="py-3 px-5 bg-gray-900 text-white font-medium">
                  Mr. Dalip Kumar
                </td>
                <td class="text-center py-3 px-4 bg-gray-900">
                  <span class="badge text-yellow-400 bg-black px-3 py-1 rounded-md text-xs">
                    PB08BJ3266
                  </span>
                </td>
                <td class="text-center py-3 px-4 bg-gray-900 text-green-400 font-semibold tracking-wide">
                  9056598913
                </td>
              </tr>
              <tr>
                <td class="text-center py-3 px-4 bg-gray-800 text-gray-400 font-semibold">
                  3.
                </td>
                <td class="py-3 px-5 bg-gray-800 text-white font-medium">
                  Mr. Rajesh Kumar Maurya
                </td>
                <td class="text-center py-3 px-4 bg-gray-800">
                  <span class="badge text-yellow-400 bg-black px-3 py-1 rounded-md text-xs">
                    PB08CB6756
                  </span>
                </td>
                <td class="text-center py-3 px-4 bg-gray-800 text-green-400 font-semibold tracking-wide">
                  9888258122
                </td>
              </tr>
              <tr>
                <td class="text-center py-3 px-4 bg-gray-900 text-gray-400 font-semibold">
                  4.
                </td>
                <td class="py-3 px-5 bg-gray-900 text-white font-medium">
                  Mr. Talwinder Singh
                </td>
                <td class="text-center py-3 px-4 bg-gray-900">
                  <span class="badge text-yellow-400 bg-black px-3 py-1 rounded-md text-xs">
                    PB08FM6267
                  </span>
                </td>
                <td class="text-center py-3 px-4 bg-gray-900 text-green-400 font-semibold tracking-wide">
                  9463787031
                </td>
              </tr>
              <tr>
                <td class="text-center py-3 px-4 bg-gray-800 text-gray-400 font-semibold">
                  5.
                </td>
                <td class="py-3 px-5 bg-gray-800 text-white font-medium">
                  Mr. Deepak Mishra
                </td>
                <td class="text-center py-3 px-4 bg-gray-800">
                  <span class="badge text-yellow-400 bg-black px-3 py-1 rounded-md text-xs">
                    PB08EJ4263
                  </span>
                </td>
                <td class="text-center py-3 px-4 bg-gray-800 text-green-400 font-semibold tracking-wide">
                  6283102788 /<br />
                  8557989052
                </td>
              </tr>
              <tr>
                <td class="text-center py-3 px-4 bg-gray-900 text-gray-400 font-semibold">
                  6.
                </td>
                <td class="py-3 px-5 bg-gray-900 text-white font-medium">
                  Mr. Balwinder
                </td>
                <td class="text-center py-3 px-4 bg-gray-900">
                  <span class="badge text-yellow-400 bg-black px-3 py-1 rounded-md text-xs">
                    PB08FT6965
                  </span>
                </td>
                <td class="text-center py-3 px-4 bg-gray-900 text-green-400 font-semibold tracking-wide">
                  7986478437
                </td>
              </tr>
              <tr>
                <td class="text-center py-3 px-4 bg-gray-800 text-gray-400 font-semibold">
                  7.
                </td>
                <td class="py-3 px-5 bg-gray-800 text-white font-medium">
                  Mr. Lakhwinder Singh
                </td>
                <td class="text-center py-3 px-4 bg-gray-800">
                  <span class="badge text-yellow-400 bg-black px-3 py-1 rounded-md text-xs">
                    PB08Z7767
                  </span>
                </td>
                <td class="text-center py-3 px-4 bg-gray-800 text-green-400 font-semibold tracking-wide">
                  8968893936
                </td>
              </tr>
              <tr>
                <td class="text-center py-3 px-4 bg-gray-900 text-gray-400 font-semibold">
                  8.
                </td>
                <td class="py-3 px-5 bg-gray-900 text-white font-medium">
                  Mr. RajKumar
                </td>
                <td class="text-center py-3 px-4 bg-gray-900">
                  <span class="badge text-yellow-400 bg-black px-3 py-1 rounded-md text-xs">
                    PB09X1832
                  </span>
                </td>
                <td class="text-center py-3 px-4 bg-gray-900 text-green-400 font-semibold tracking-wide">
                  7696171228
                </td>
              </tr>
              <tr>
                <td class="text-center py-3 px-4 bg-gray-800 text-gray-400 font-semibold">
                  9.
                </td>
                <td class="py-3 px-5 bg-gray-800 text-white font-medium">
                  Mr. Rajinder Kumar
                </td>
                <td class="text-center py-3 px-4 bg-gray-800">
                  <span class="badge text-yellow-400 bg-black px-3 py-1 rounded-md text-xs">
                    PB08FH5387
                  </span>
                </td>
                <td class="text-center py-3 px-4 bg-gray-800 text-green-400 font-semibold tracking-wide">
                  9872071380
                </td>
              </tr>
              <tr>
                <td class="text-center py-3 px-4 bg-gray-900 text-gray-400 font-semibold">
                  10.
                </td>
                <td class="py-3 px-5 bg-gray-900 text-white font-medium">
                  Mr. Prashant Sircar
                </td>
                <td class="text-center py-3 px-4 bg-gray-900">
                  <span class="badge text-yellow-400 bg-black px-3 py-1 rounded-md text-xs">
                    PB08FF3784
                  </span>
                </td>
                <td class="text-center py-3 px-4 bg-gray-900 text-green-400 font-semibold tracking-wide">
                  8847573188
                </td>
              </tr>
            </tbody>
          </table>

          <div class="bg-green-700 px-6 py-3 flex items-center justify-between">
            <p class="text-green-200 text-xs tracking-widest uppercase">
              10 Registered Drivers
            </p>
            <div class="flex gap-3">
              <span class="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-white inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-black inline-block"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Authorised;
