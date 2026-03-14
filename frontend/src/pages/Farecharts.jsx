import React from 'react'

const routes = [
  { name: "Maqsuda", share: 20, privDay: 120, privNight: 200, towards: 250 },
  { name: "Patel Chowk", share: 30, privDay: 180, privNight: 300, towards: 350 },
  { name: "Jyoti Chowk", share: 50, privDay: 200, privNight: 350, towards: 400 },
  { name: "MBD Mall", share: 50, privDay: 200, privNight: 400, towards: 450 },
  { name: "Model Town", share: 50, privDay: 250, privNight: 400, towards: 450 },
  { name: "PPR Mall", share: 60, privDay: 300, privNight: 500, towards: 550 },
  { name: "Bus Stand", share: 50, privDay: 250, privNight: 400, towards: 450 },
  { name: "Curo Mall", share: 70, privDay: 300, privNight: 500, towards: 550 },
  { name: "City Railway Station", share: 50, privDay: 250, privNight: 400, towards: 450 },
  { name: "Guru Nanak Mission Chowk", share: 50, privDay: 250, privNight: 400, towards: 450 },
  { name: "Toor Enclave", share: 20, privDay: 50, privNight: 150, towards: 200 },
  { name: "Verka Milkplant", share: 20, privDay: 50, privNight: 150, towards: 200 },
  { name: "SERB Complex", share: 30, privDay: 100, privNight: 200, towards: 250 },
  { name: "Pathankot Bypass", share: 30, privDay: 100, privNight: 250, towards: 300 },
  { name: "PAP Chowk", share: 50, privDay: 250, privNight: 450, towards: 450 },
  { name: "Rama Mandi", share: 60, privDay: 250, privNight: 450, towards: 500 },
  { name: "Cantt. Railway Station", share: 60, privDay: 300, privNight: 450, towards: 500 },
  { name: "Saffron Tower (Phagwara Rd)", share: 70, privDay: 300, privNight: 500, towards: 550 },
  { name: "Havelli & EastWood Village", share: 80, privDay: 400, privNight: 550, towards: 600 },
  { name: "LPU Phagwara", share: 80, privDay: 450, privNight: 600, towards: 650 },
  { name: "Bidhipur", share: 20, privDay: 50, privNight: 100, towards: 150 },
  { name: "Kartarpur", share: 30, privDay: 100, privNight: 200, towards: 250 },
];

function CardHeader({ label, title }) {
  return (
    <div className="bg-yellow-400 px-6 py-4 flex items-center justify-between border-b-4 border-green-700 shadow-[0_4px_0_#166534]">
      <div>
        <p className="text-black text-xs font-bold tracking-widest uppercase opacity-60 mb-0.5">
          {label}
        </p>
        <h2 className="text-black text-2xl font-bold leading-tight">
          {title}
        </h2>
      </div>
    </div>
  );
}

function CardFooter({ count }) {
  return (
    <div className="bg-green-700 px-5 py-2.5 flex items-center justify-between">
      <p className="text-green-200 text-xs tracking-widest uppercase">
        {count} Routes Listed
      </p>
      <div className="flex gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
        <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
        <span className="w-2.5 h-2.5 rounded-full bg-black inline-block" />
      </div>
    </div>
  );
}

function NoteStrip({ children }) {
  return (
    <div className="bg-black border-l-4 border-yellow-400 px-4 py-2 text-[11px] text-gray-400 tracking-wide">
      {children}
    </div>
  );
}

function FromCollege() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-700">
      <CardHeader
        label="Fare Chart — From College"
        title="NIT Jalandhar → Destination"
      />
      <NoteStrip>
        <span className="text-yellow-400 font-semibold">Private fare:</span> max 3 persons &nbsp;|&nbsp;
        <span className="text-yellow-400 font-semibold">Sharing/Waiting:</span> per person &nbsp;|&nbsp;
        All fares in ₹
      </NoteStrip>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-green-700">
              {/* <th className="text-white text-left py-3 px-4 font-bold text-xs uppercase tracking-widest w-10">#</th> */}
              <th className="text-white text-left py-3 px-4 font-bold text-xs uppercase tracking-widest">Destination</th>
              <th className="text-white text-right py-3 px-4 font-bold text-xs uppercase tracking-widest whitespace-nowrap">Sharing<br /><span className="font-normal opacity-70 normal-case">5AM–9PM</span></th>
              <th className="text-white text-right py-3 px-4 font-bold text-xs uppercase tracking-widest whitespace-nowrap">Private in Day<br /><span className="font-normal opacity-70 normal-case">5AM–9PM </span></th>
              <th className="text-white text-right py-3 px-4 font-bold text-xs uppercase tracking-widest whitespace-nowrap">Private in Night<br /><span className="font-normal opacity-70 normal-case">9PM–5AM</span></th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}>
                {/* <td className="py-2.5 px-4 text-gray-500 text-xs">{i + 1}</td> */}
                <td className="py-2.5 px-4 text-white font-medium">{r.name}</td>
                <td className="py-2.5 px-4 text-right text-blue-300 font-semibold tabular-nums">₹{r.share}</td>
                <td className="py-2.5 px-4 text-right text-green-400 font-semibold tabular-nums">₹{r.privDay}</td>
                <td className="py-2.5 px-4 text-right text-yellow-300 font-semibold tabular-nums">₹{r.privNight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CardFooter count={22} />
    </div>
  );
}

function ToCollege() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-700">
      <CardHeader
        label="Fare Chart — Towards College"
        title="Destination → NIT Jalandhar"
      />
      <NoteStrip>
        <span className="text-yellow-400 font-semibold">Night fare only (9PM–5AM):</span> Private based, max 3 persons &nbsp;|&nbsp; All fares in ₹
      </NoteStrip>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-green-700">
              {/* <th className="text-white text-left py-3 px-4 font-bold text-xs uppercase tracking-widest w-10">#</th> */}
              <th className="text-white text-left py-3 px-4 font-bold text-xs uppercase tracking-widest">Origin</th>
              <th className="text-white text-right py-3 px-4 font-bold text-xs uppercase tracking-widest whitespace-nowrap">Night Fare<br /><span className="font-normal opacity-70 normal-case">9PM–5AM (₹)</span></th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}>
                {/* <td className="py-2.5 px-4 text-gray-500 text-xs">{i + 1}</td> */}
                <td className="py-2.5 px-4 text-white font-medium">{r.name}</td>
                <td className="py-2.5 px-4 text-right text-yellow-300 font-semibold tabular-nums">₹{r.towards}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CardFooter count={22} />
    </div>
  );
}

export default function Farecharts() {
  return (
    <div className="min-h-screen  p-6 flex flex-col items-center">
        <p className="text-black text-2xl font-bold leading-tight text-center">Fare Charts</p>
        <p className='text-gray-500 text-center'>Note: These are the fares provided by the college. You can negotiate with the driver for a better price.</p>
        <a href="https://drive.google.com/file/d/1fVIurkWg8qjzf7mcvreXn2cqSHWu9rIG/view?usp=sharing" target="_blank" className='text-blue-400 p-4 underline cursor-pointer hover:text-blue-600 hover:font-bold font-bold' >View the Provided File</a>
      <div className="w-full max-w-3xl space-y-8">
        <FromCollege />
        <ToCollege />
      </div>
    </div>
  );
}