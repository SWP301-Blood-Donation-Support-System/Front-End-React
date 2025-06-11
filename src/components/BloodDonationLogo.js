import React from 'react';

const BloodDonationLogo = ({ size = 40, textSize = 16 }) => {
  return (
    <div className="blood-donation-logo">
      {/* Heart with drop logo */}
      <div className="blood-donation-logo-icon">
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Heart shape */}
          <path 
            d="M20 35C20 35 5 25 5 15C5 10.58 8.58 7 13 7C15.54 7 17.79 8.16 19.21 10.05L20 11L20.79 10.05C22.21 8.16 24.46 7 27 7C31.42 7 35 10.58 35 15C35 25 20 35 20 35Z" 
            fill="#dc2626" 
            stroke="#dc2626" 
            strokeWidth="1"
          />
          {/* Plus sign in center */}
          <path 
            d="M20 13V23M15 18H25" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />
          {/* Blood drop */}
          <ellipse 
            cx="28" 
            cy="12" 
            rx="3" 
            ry="4" 
            fill="#761611"
            transform="rotate(15 28 12)"
          />
        </svg>
      </div>
      
      {/* Text */}
      <div>
        <div 
          className="blood-donation-logo-text-primary"
          style={{ fontSize: textSize }}
        >
          LifeFlow
        </div>
        <div 
          className="blood-donation-logo-text-secondary"
          style={{ fontSize: textSize * 0.75 }}
        >
          Blood Services
        </div>
      </div>
    </div>
  );
};

export default BloodDonationLogo;
