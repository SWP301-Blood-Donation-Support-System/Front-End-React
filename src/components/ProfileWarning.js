import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const ProfileWarning = ({ showLink = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);

  const isProfileComplete = (userProfile) => {
    if (!userProfile) return false;
    
    const requiredFields = [
      userProfile.FullName || userProfile.name,
      userProfile.PhoneNumber,
      userProfile.Address,
      userProfile.DateOfBirth,
      userProfile.GenderId || userProfile.GenderID,
      userProfile.BloodTypeId || userProfile.BloodTypeID
    ];
    
    // Debug log để kiểm tra
    console.log('ProfileWarning - userProfile:', userProfile);
    console.log('ProfileWarning - requiredFields:', requiredFields);
    console.log('ProfileWarning - isComplete:', requiredFields.every(field => field != null && field !== ''));
    
    return requiredFields.every(field => field != null && field !== '');
  };

  useEffect(() => {
    const checkUserProfile = () => {
      try {
        const token = localStorage.getItem("token");
        const userInfo = localStorage.getItem("userInfo");
        
        if (!token || !userInfo) {
          setShowWarning(false);
          return;
        }

        const userProfile = JSON.parse(userInfo);
        
        // Debug log
        console.log('ProfileWarning - checking user profile...', userProfile);
        
        // Chỉ hiển thị cảnh báo nếu user đã đăng nhập và chưa hoàn thành hồ sơ
        if (userProfile && !isProfileComplete(userProfile)) {
          setShowWarning(true);
          console.log('ProfileWarning - showing warning');
        } else {
          setShowWarning(false);
          console.log('ProfileWarning - hiding warning');
        }
      } catch (error) {
        console.error("Error checking user profile:", error);
        setShowWarning(false);
      }
    };

    checkUserProfile();

    // Listen for storage changes to update warning when user logs in/out
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'userInfo') {
        checkUserProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when profile is updated
    const handleProfileUpdate = () => {
      checkUserProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  if (!showWarning) {
    return null;
  }

  // Kiểm tra xem có phải đang ở ProfilePage không
  const isProfilePage = location.pathname === '/profile';
  
  const handleGoToProfile = () => {
    navigate('/profile');
  };

  return (
    <Alert
      message="Cập nhật thông tin cá nhân cần thiết"
      description={
        <div>
          {showLink && !isProfilePage ? (
            <>
              Để có thể đăng ký hiến máu, vui lòng cập nhật tại{' '}
              <span 
                onClick={handleGoToProfile}
                style={{ 
                  color: '#dc2626',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 'bold'
                }}
              >
                trang cá nhân
              </span>
              {' '}đầy đủ thông tin cá nhân của bạn bao gồm: họ tên, số điện thoại, địa chỉ, ngày sinh, giới tính và nhóm máu.
            </>
          ) : (
            "Để có thể đăng ký hiến máu, vui lòng cập nhật đầy đủ thông tin cá nhân của bạn bao gồm: họ tên, số điện thoại, địa chỉ, ngày sinh, giới tính và nhóm máu."
          )}
        </div>
      }
      type="warning"
      icon={<ExclamationCircleOutlined />}
      showIcon
      closable
      style={{ 
        margin: '16px 24px 0 24px',
        borderRadius: '8px'
      }}
      onClose={() => setShowWarning(false)}
    />
  );
};

export default ProfileWarning;
