import React, { useEffect, useState } from "react";
import { Layout, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { UserAPI } from "../api/User";

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState();
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (token && userInfo) {
          // Khởi tạo user state với thông tin cơ bản từ localStorage
          setUser(userInfo);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("fullname");
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AntHeader className="header-container">
      {/* Logo using logo.svg - clickable to go home */}
      <div onClick={() => navigate("/")} className="header-logo">
        <img src="/images/logo.svg" alt="Blood Services Logo" />
      </div>
      {user ? 
      <>
       <Button
          type="primary"
          icon={<UserOutlined />}
          onClick={() => {
            UserAPI.logout();
            setUser(null);
            navigate("/");
        }}
          size="large"
          className="header-login-btn"
        >
         おはいよう　{user.FullName}
        </Button>
        <Button
          type="primary"
          icon={<UserOutlined />}
          onClick={() => {
            UserAPI.logout();
            setUser(null);
            navigate("/");
        }}
          size="large"
          className="header-login-btn"
        >
         Logout
        </Button>
      </>    
       : (
        <Button
          type="primary"
          icon={<UserOutlined />}
          onClick={() => navigate("/login")}
          size="large"
          className="header-login-btn"
        >
          Đăng Nhập
        </Button>
      )}
    </AntHeader>
  );
};

export default Header;
