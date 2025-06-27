import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffNavbar = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleDashboard = () => {
    navigate('/staff/schedule-management?type=all');
  };

  const handleEmergencyBloodBag = () => {
    // Temporarily no action, as requested
    console.log('Emergency Blood Bag clicked');
  };

  return (
    <div className="staff-navbar">
      <div className="staff-navbar-content">
        <nav className="staff-nav-tabs">
          <button 
            className={`staff-nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={handleDashboard}
          >
            Dashboard
          </button>
          <button 
            className={`staff-nav-tab ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={handleEmergencyBloodBag}
          >
            Đơn túi máu khẩn cấp
          </button>
        </nav>
      </div>
    </div>
  );
};

export default StaffNavbar; 