import React from 'react';
import { Layout } from 'antd';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StoriesSection from '../components/StoriesSection';
import AfterDonationSection from '../components/AfterDonationSection';
import Footer from '../components/Footer';

const { Content } = Layout;

const Homepage = () => {  return (
    <Layout className="homepage">
      <Header />
      <Navbar />      <Content>
        <HeroSection />
        <StoriesSection />
        <AfterDonationSection />
      </Content>
      <Footer />
    </Layout>
  );
};

export default Homepage;
