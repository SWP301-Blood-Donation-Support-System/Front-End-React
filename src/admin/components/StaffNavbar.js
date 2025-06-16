import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffNavbar = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/'); // Redirect to homepage
  };

  return (
    <div className="staff-navbar">
      <div className="staff-navbar-content">
        <nav className="staff-nav-tabs">
          <button 
            className={`staff-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={handleBackToHome}
          >
            Về Trang Chủ
          </button>
        </nav>
      </div>
    </div>
  );
};

export default StaffNavbar; 