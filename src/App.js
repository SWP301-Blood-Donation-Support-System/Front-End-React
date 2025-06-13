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
import StaffPage from './pages/StaffPage';
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
            <Route path="/staff" element={<StaffPage />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
