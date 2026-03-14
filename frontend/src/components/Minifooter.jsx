import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


const Minifooter = () => {
 
  return (
   

        <div className="border-t border-gray-700 mb-10 px-2 pt-2">
        
           
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 px-1 text-center">
              <Link
                to="/about"
                className="text-gray-600 hover:text-primary transition-colors text-sm no-underline"
              >
                About RideMate
              </Link>
              <Link
                to="/privacy-policy"
                className="text-gray-600 hover:text-primary transition-colors text-sm no-underline"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-conditions"
                className="text-gray-600 hover:text-primary transition-colors text-sm no-underline"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/driver-consent"
                className="text-gray-600 hover:text-primary transition-colors text-sm no-underline"
              >
                Driver Consent
              </Link>
            </div>
          </div>

        
      
  );
};

export default Minifooter;
