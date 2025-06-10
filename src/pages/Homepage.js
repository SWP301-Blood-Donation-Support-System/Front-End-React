import React from 'react';
import { Layout } from 'antd';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StoriesSection from '../components/StoriesSection';
import Footer from '../components/Footer';

const { Content } = Layout;

const Homepage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Navbar />
      <Content>
        <HeroSection />
        <StoriesSection />
      </Content>
      <Footer />
    </Layout>
  );
};

export default Homepage;
