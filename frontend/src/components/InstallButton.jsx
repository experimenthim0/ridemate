import { useState } from 'react';
import useInstallPWA from '../hooks/useInstallPWA';

const InstallButton = () => {
  const { supportsPWA, onClick, isIOS } = useInstallPWA();
  const [showInstructions, setShowInstructions] = useState(false);

  // if (!supportsPWA) return null; // Hide button if not supported

  const handleInstallClick = (e) => {
    const result = onClick(e);
    if (result === "SHOW_INSTRUCTIONS") {
      setShowInstructions(true);
    }
  };

  return (
    <>
      <button 
        onClick={handleInstallClick} 
        className="bg-primary text-black font-bold py-2 px-4 rounded-full  hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
      >
        <i className="ri-download-cloud-2-line text-lg"></i>
        <span>Install App</span>
      </button>

      {/* iOS Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-auto-black border border-neutral-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
            
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>

            <div className="relative text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <img src="/icons8-auto-rickshaw-94.png" alt="RideMate" className="w-12 h-12" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Install RideMate</h3>
              <p className="text-gray-400 text-sm mb-8">Follow these steps to add RideMate to your home screen:</p>
              
              <div className="space-y-6 text-left">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-primary font-bold border border-neutral-700 group-hover:border-primary/50 transition-colors">1</div>
                  <p className="text-gray-300 text-sm">Tap the <span className="text-white font-bold inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded px-2"><i className="ri-share-box-line"></i> share</span> button below.</p>
                </div>
                
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-primary font-bold border border-neutral-700 group-hover:border-primary/50 transition-colors">2</div>
                  <p className="text-gray-300 text-sm">Scroll down and tap <span className="text-white font-bold inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded px-2"><i className="ri-add-box-line"></i> Add to Home Screen</span>.</p>
                </div>
                
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-primary font-bold border border-neutral-700 group-hover:border-primary/50 transition-colors">3</div>
                  <p className="text-gray-300 text-sm">Tap <span className="text-primary font-black uppercase tracking-wider">Add</span> in the top right corner.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowInstructions(false)}
                className="mt-10 w-full py-4 bg-primary hover:bg-primary-dark text-black font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-primary/20"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallButton;
