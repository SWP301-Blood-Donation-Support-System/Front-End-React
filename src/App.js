import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FAQPage from './pages/FAQPage';
import SearchPage from './pages/SearchPage';
import NewsPage from './pages/NewsPage';
import BookingPage from './pages/BookingPage';
import EligibilityFormPage from './pages/EligibilityFormPage';
import ProfilePage from './pages/ProfilePage';
import StaffPage from './admin/pages/StaffPage';
import ScheduleManagementPage from './admin/pages/ScheduleManagementPage';
import DonationRecordsPage from './admin/pages/DonationRecordsPage';
import CreateDonationRecordPage from './admin/pages/CreateDonationRecordPage';
import './styles/main.scss';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#dc2626',
          borderRadius: 6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
          colorText: '#000000', // Set default text color to black
          colorTextSecondary: '#333333',
        },
        components: {
          Typography: {
            colorText: 'inherit',
          }
        }
      }}
    >
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/eligibility" element={<EligibilityFormPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/staff/schedule-management" element={<ScheduleManagementPage />} />
            <Route path="/staff/donation-records" element={<DonationRecordsPage />} />
            <Route path="/staff/donation-records/create" element={<CreateDonationRecordPage />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
