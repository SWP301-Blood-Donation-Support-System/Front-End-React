import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SuccessfullyResetPasswordPage from './pages/SuccessfullyResetPasswordPage';
import ErrorResetPasswordPage from './pages/ErrorResetPasswordPage';
import FAQPage from './pages/FAQPage';
import SearchPage from './pages/SearchPage';
import NewsPage from './pages/NewsPage';
import BookingPage from './pages/BookingPage';
import EligibilityFormPage from './pages/EligibilityFormPage';
import ConfirmationPage from './pages/ConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import DonationSchedulePage from './pages/DonationSchedulePage';
import CheckinPage from './pages/CheckinPage';
import SettingsPage from './pages/SettingsPage';

import ScheduleManagementPage from './admin/pages/management/ScheduleManagementPage';
import UserManagementPage from './admin/pages/management/UserManagementPage';
import StaffManagementPage from './admin/pages/management/StaffManagementPage';
import BloodBagManagementPage from './admin/pages/management/BloodBagManagementPage';
import DonationRecordsPage from './admin/pages/management/DonationRecordsPage';
import CreateDonationRecordPage from './admin/pages/management/CreateDonationRecordPage';
import StaffProfilePage from './admin/pages/setting/StaffProfilePage';
import CreateStaffAccountPage from './admin/pages/management/CreateStaffAccountPage';
import StaffSettingsPage from './admin/pages/setting/StaffSettingsPage';
import HospitalListPage from './admin/pages/hospital/HospitalListPage';
import HospitalRegistrationPage from './admin/pages/hospital/HospitalRegistrationPage';
import CreateHospitalAccountPage from './admin/pages/hospital/CreateHospitalAccountPage';
import HospitalAccountsPage from './admin/pages/hospital/HospitalAccountsPage';
import EmergencyRequestPage from './admin/pages/management/EmergencyRequestPage';
import ApproveRequestsPage from './admin/pages/management/ApproveRequestsPage';
import HospitalRequestsPage from './admin/pages/hospital/HospitalRequestsPage';
import RequestDetailPage from './admin/pages/management/RequestDetailPage';
import RequestHistoryPage from './admin/pages/management/RequestHistoryPage';
import RequestHistoryDetailPage from './admin/pages/management/RequestHistoryDetailPage';
import BloodUnitSelectionPage from './admin/pages/management/BloodUnitSelectionPage';
import ArticleManagementPage from './admin/pages/management/ArticleManagementPage';
import CreateArticlePage from './admin/pages/management/CreateArticlePage';
import EditArticlePage from './admin/pages/management/EditArticlePage';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';
import './styles/main.scss';

function App() {
  // Configure message globally
  message.config({
    top: 100,
    duration: 4,
    maxCount: 3,
    rtl: false,
  });

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#dc2626',
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-password-success" element={<SuccessfullyResetPasswordPage />} />
          <Route path="/reset-password-error" element={<ErrorResetPasswordPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/booking" element={
            <UserProtectedRoute>
              <BookingPage />
            </UserProtectedRoute>
          } />
          <Route path="/eligibility-form" element={
            <UserProtectedRoute>
              <EligibilityFormPage />
            </UserProtectedRoute>
          } />
          <Route path="/confirmation" element={
            <UserProtectedRoute>
              <ConfirmationPage />
            </UserProtectedRoute>
          } />
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
          <Route path="/settings" element={
            <UserProtectedRoute>
              <SettingsPage />
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
          <Route path="/staff/create-staff-account" element={
            <AdminProtectedRoute>
              <CreateStaffAccountPage />
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
          <Route path="/staff/article-management" element={
            <AdminProtectedRoute>
              <ArticleManagementPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/create-article" element={
            <AdminProtectedRoute>
              <CreateArticlePage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/edit-article/:articleId" element={
            <AdminProtectedRoute>
              <EditArticlePage />
            </AdminProtectedRoute>
          } />
          
          <Route path="/staff/profile" element={
            <AdminProtectedRoute>
              <StaffProfilePage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/settings" element={
            <AdminProtectedRoute>
              <StaffSettingsPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/hospital-list" element={
            <AdminProtectedRoute>
              <HospitalListPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/hospital-registration" element={
            <AdminProtectedRoute>
              <HospitalRegistrationPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/create-hospital-account" element={
            <AdminProtectedRoute>
              <CreateHospitalAccountPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/hospital-accounts" element={
            <AdminProtectedRoute>
              <HospitalAccountsPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/emergency-request" element={
            <AdminProtectedRoute>
              <EmergencyRequestPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/approve-requests" element={
            <AdminProtectedRoute>
              <ApproveRequestsPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/request-history" element={
            <AdminProtectedRoute>
              <RequestHistoryPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/request-history/detail/:requestId" element={
            <AdminProtectedRoute>
              <RequestHistoryDetailPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/approve-requests/hospital/:hospitalId" element={
            <AdminProtectedRoute>
              <HospitalRequestsPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/approve-requests/request/:requestId" element={
            <AdminProtectedRoute>
              <RequestDetailPage />
            </AdminProtectedRoute>
          } />
          <Route path="/staff/approve-requests/blood-selection/:requestId" element={
            <AdminProtectedRoute>
              <BloodUnitSelectionPage />
            </AdminProtectedRoute>
          } />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
