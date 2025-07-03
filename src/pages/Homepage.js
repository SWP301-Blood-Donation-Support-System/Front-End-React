import React, { useEffect, useRef } from 'react';
import { Layout, notification } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ProfileWarning from '../components/ProfileWarning';
import HeroSection from '../components/HeroSection';
import BloodDonationProcessSection from '../components/BloodDonationProcessSection';
import EligibilityCriteriaSection from '../components/EligibilityCriteriaSection';
import ImportantNotesSection from '../components/ImportantNotesSection';
import AfterDonationSection from '../components/AfterDonationSection';
import Footer from '../components/Footer';

const { Content } = Layout;

const Homepage = () => {
  const [api, contextHolder] = notification.useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const notificationShown = useRef(false);

  // Handle login notification from navigation state
  useEffect(() => {
    if (location.state?.loginNotification && !notificationShown.current) {
      notificationShown.current = true;
      
      api.success({
        message: location.state.loginNotification.message,
        description: location.state.loginNotification.description,
        placement: 'topRight',
        duration: 3,
      });
      
      // Clear the notification from state to prevent showing it again
      navigate(location.pathname, { 
        state: { ...location.state, loginNotification: null }, 
        replace: true 
      });
    }
  }, [location.state, api, navigate, location.pathname]);

  return (
    <Layout className="homepage">
      {contextHolder}
      <Header />
      <Navbar />
      <ProfileWarning />
      <Content>
        <HeroSection />
        <BloodDonationProcessSection />
        <EligibilityCriteriaSection />
        <ImportantNotesSection />
        <AfterDonationSection />
      </Content>
      <Footer />
    </Layout>
  );
};

export default Homepage;
