import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FAQPage from './pages/FAQPage';
import SearchPage from './pages/SearchPage';
import NewsPage from './pages/NewsPage';
import BookingPage from './pages/BookingPage';
import EligibilityFormPage from './pages/EligibilityFormPage';
import ConfirmationPage from './pages/ConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import DonationSchedulePage from './pages/DonationSchedulePage';
import CheckinPage from './pages/CheckinPage';

import ScheduleManagementPage from './admin/pages/ScheduleManagementPage';
import UserManagementPage from './admin/pages/UserManagementPage';
import StaffManagementPage from './admin/pages/StaffManagementPage';
import BloodBagManagementPage from './admin/pages/BloodBagManagementPage';
import DonationRecordsPage from './admin/pages/DonationRecordsPage';
import CreateDonationRecordPage from './admin/pages/CreateDonationRecordPage';
import StaffProfilePage from './admin/pages/StaffProfilePage';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';
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
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/booking" element={
              <UserProtectedRoute>
                <BookingPage />
              </UserProtectedRoute>
            } />
            <Route path="/eligibility" element={<EligibilityFormPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/profile" element={
              <UserProtectedRoute>
                <ProfilePage />
              </UserProtectedRoute>
            } />
            <Route path="/donation-schedule" element={
              <UserProtectedRoute>
                <DonationSchedulePage />
              </UserProtectedRoute>
            } />
            <Route path="/checkin" element={<CheckinPage />} />

            <Route path="/staff/schedule-management" element={
              <AdminProtectedRoute>
                <ScheduleManagementPage />
              </AdminProtectedRoute>
            } />
            <Route path="/staff/user-management" element={
              <AdminProtectedRoute>
                <UserManagementPage />
              </AdminProtectedRoute>
            } />
            <Route path="/staff/staff-management" element={
              <AdminProtectedRoute>
                <StaffManagementPage />
              </AdminProtectedRoute>
            } />
            <Route path="/staff/blood-bag-management" element={
              <AdminProtectedRoute>
                <BloodBagManagementPage />
              </AdminProtectedRoute>
            } />
            <Route path="/staff/donation-records" element={
              <AdminProtectedRoute>
                <DonationRecordsPage />
              </AdminProtectedRoute>
            } />
            <Route path="/staff/donation-records/create" element={
              <AdminProtectedRoute>
                <CreateDonationRecordPage />
              </AdminProtectedRoute>
            } />
            <Route path="/staff/profile" element={
              <AdminProtectedRoute>
                <StaffProfilePage />
              </AdminProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
