import { useEffect, useState } from 'react';

const useInstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    
    setIsIOS(isIOSDevice);

    const handler = (e) => {
      e.preventDefault(); // Prevent the default browser prompt
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If it's iOS, we can still show instructions, so we "support" it in a different way
    if (isIOSDevice) {
      setSupportsPWA(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (isIOS) {
      // For iOS, we'll return a state that triggers a modal in the component
      return "SHOW_INSTRUCTIONS";
    }
    if (!promptInstall) return;
    promptInstall.prompt(); // Show the install prompt
  };

  return { supportsPWA, onClick, isIOS };
};

export default useInstallPWA;
