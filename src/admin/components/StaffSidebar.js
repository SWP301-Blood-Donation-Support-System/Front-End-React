import React, { useState, useEffect, useRef } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  MenuOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  PlusCircleOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  UsergroupAddOutlined,
  BankOutlined,
  HomeOutlined,
  SafetyOutlined,
  AccountBookOutlined,
  ExclamationCircleOutlined,
  AuditOutlined,
  HistoryOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, notification } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { UserAPI } from "../../api/User";
import { isAdminUser, isHospitalUser } from "../utils/passwordUtils";

const { Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const StaffSidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [api, contextHolder] = notification.useNotification();
  const autoOpenedRef = useRef(new Set()); // Track which submenus were auto-opened
  const previousCollapsedRef = useRef(collapsed); // Track previous collapsed state
  const savedOpenKeysRef = useRef([]); // Store openKeys before collapsing

  const [openKeys, setOpenKeys] = useState(() => {
    // Try to load from localStorage first
    const savedOpenKeys = localStorage.getItem("staffSidebar_openKeys");
    if (savedOpenKeys) {
      try {
        const parsed = JSON.parse(savedOpenKeys);
        return parsed;
      } catch (error) {
        console.warn("Failed to parse saved openKeys:", error);
      }
    }

    // Initialize openKeys based on current path
    const pathname = location.pathname;
    const initialOpenKeys = [];

    if (pathname.includes("/staff/donation-records")) {
      initialOpenKeys.push("4");
      autoOpenedRef.current.add("4"); // Mark as auto-opened
    }

    return initialOpenKeys;
  });

  // Handle sidebar collapse/expand state change
  useEffect(() => {
    // If sidebar is being collapsed
    if (collapsed && !previousCollapsedRef.current) {
      // Save current openKeys before collapsing
      savedOpenKeysRef.current = [...openKeys];
      // Close all dropdowns when collapsing
      setOpenKeys([]);
    }
    // If sidebar is being expanded
    else if (!collapsed && previousCollapsedRef.current) {
      // Restore previously saved openKeys when expanding
      if (savedOpenKeysRef.current.length > 0) {
        setOpenKeys(savedOpenKeysRef.current);
      }
    }

    // Update previous state
    previousCollapsedRef.current = collapsed;
  }, [collapsed, openKeys]);

  // Save openKeys to localStorage whenever it changes (but only when sidebar is expanded)
  useEffect(() => {
    if (!collapsed) {
      localStorage.setItem("staffSidebar_openKeys", JSON.stringify(openKeys));
    }
  }, [openKeys, collapsed]);

  // Function to get selected key based on current path
  const getSelectedKey = () => {
    const pathname = location.pathname;
    const search = location.search;

    if (pathname.includes("/staff/schedule-management")) {
      return ["1"];
    } else if (pathname.includes("/staff/user-management")) {
      // Only return key if user is admin, otherwise return default
      return isAdminUser() ? ["2"] : ["1"];
    } else if (pathname.includes("/staff/staff-management")) {
      return ["9"];
    } else if (pathname.includes("/staff/create-staff-account")) {
      return ["10"];
    } else if (pathname.includes("/staff/blood-bag-management")) {
      return ["3"];
    } else if (pathname.includes("/staff/donation-records")) {
      if (pathname.includes("/create")) return ["4-2"];
      return ["4-1"];
    } else if (pathname.includes("/staff/reports")) {
      // Only return key if user is admin, otherwise return default
      return isAdminUser() ? ["5"] : ["1"];
    } else if (pathname.includes("/staff/hospital-list")) {
      return isAdminUser() || isHospitalUser() ? ["11"] : ["1"];
    } else if (pathname.includes("/staff/hospital-registration")) {
      return isAdminUser() || isHospitalUser() ? ["12"] : ["1"];
    } else if (pathname.includes("/staff/create-hospital-account")) {
      return isAdminUser() || isHospitalUser() ? ["13"] : ["1"];
    } else if (pathname.includes("/staff/hospital-accounts")) {
      return isAdminUser() || isHospitalUser() ? ["14"] : ["1"];
    } else if (pathname.includes("/staff/emergency-request")) {
      return isAdminUser() || isHospitalUser() ? ["15"] : ["1"];
    } else if (pathname.includes("/staff/approve-requests")) {
      return isAdminUser() || isHospitalUser() ? ["16"] : ["1"];
    } else if (pathname.includes("/staff/request-history")) {
      return isHospitalUser() ? ["17"] : ["1"];
    } else if (pathname.includes("/staff/profile")) {
      return ["6"];
    }

    // Default route based on user role
    if (isHospitalUser()) {
      return ["15"]; // default to emergency request for hospital users
    }
    return ["1"]; // default to schedule management for admin/staff
  };

  // Handle logout functionality
  const handleLogout = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const userName = userInfo?.FullName || userInfo?.name || "Staff";

    UserAPI.logout();

    // Show logout notification
    api.success({
      message: "Đăng xuất thành công!",
      description: `Tạm biệt ${userName}! Hẹn gặp lại bạn sau.`,
      placement: "topRight",
      duration: 3,
    });

    navigate("/");
  };

  // Simple handler - just update openKeys when sidebar is expanded
  const onOpenChange = (keys) => {
    // Only allow opening/closing dropdowns when sidebar is expanded
    if (!collapsed) {
      setOpenKeys(keys);
    }
  };

  // Auto-open relevant submenu when navigating to child pages (only when sidebar is expanded)
  useEffect(() => {
    if (collapsed) return; // Don't auto-open when sidebar is collapsed

    const pathname = location.pathname;

    // Auto-open submenu for donation records pages
    if (pathname.includes("/staff/donation-records")) {
      setOpenKeys((prev) => {
        if (!prev.includes("4")) {
          autoOpenedRef.current.add("4");
          return [...prev, "4"];
        }
        return prev;
      });
    }
    // For other pages, do nothing - preserve current open state
  }, [location.pathname, collapsed]);

  // Handle menu item clicks
  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "1": // Lịch đặt hiến - prioritize upcoming schedules
        navigate("/staff/schedule-management?type=all");
        break;
      case "2": // Quản lý người hiến (admin only)
        if (isAdminUser()) {
          navigate("/staff/user-management");
        } else {
          api.warning({
            message: "Không có quyền truy cập",
            description: "Bạn không có quyền truy cập chức năng này.",
            placement: "topRight",
            duration: 3,
          });
        }
        break;
      case "3": // Quản lý túi máu - show all blood units
        navigate("/staff/blood-bag-management?status=all");
        break;
      case "4-1": // Danh sách hồ sơ hiến máu
        navigate("/staff/donation-records");
        break;
      case "4-2": // Tạo hồ sơ hiến máu
        navigate("/staff/donation-records/create");
        break;
      case "5": // Báo cáo thống kê (admin only)
        if (isAdminUser()) {
          // TODO: Navigate to reports when implemented
          api.info({
            message: "Chức năng đang phát triển",
            description: "Tính năng báo cáo thống kê đang được phát triển.",
            placement: "topRight",
            duration: 3,
          });
        } else {
          api.warning({
            message: "Không có quyền truy cập",
            description: "Bạn không có quyền truy cập chức năng này.",
            placement: "topRight",
            duration: 3,
          });
        }
        break;
      case "6": // Hồ sơ
        navigate("/staff/profile");
        break;
      case "7": // Cài đặt
        navigate("/staff/settings");
        break;
      case "8": // Trợ giúp
        // TODO: Navigate to help page
        break;
      case "9": // Quản lý nhân viên (admin only)
        if (isAdminUser()) {
          navigate("/staff/staff-management");
        }
        break;
      case "10": // Tạo tài khoản nhân viên (admin only)
        if (isAdminUser()) {
          navigate("/staff/create-staff-account");
        }
        break;
      case "11": // Danh sách bệnh viện (admin or hospital users)
        if (isAdminUser() || isHospitalUser()) {
          navigate("/staff/hospital-list");
        } else {
          api.warning({
            message: "Không có quyền truy cập",
            description: "Bạn không có quyền truy cập chức năng này.",
            placement: "topRight",
            duration: 3,
          });
        }
        break;
      case "12": // Đăng ký bệnh viện (admin or hospital users)
        if (isAdminUser() || isHospitalUser()) {
          navigate("/staff/hospital-registration");
        } else {
          api.warning({
            message: "Không có quyền truy cập",
            description: "Bạn không có quyền truy cập chức năng này.",
            placement: "topRight",
            duration: 3,
          });
        }
        break;
      case "13": // Tạo tài khoản bệnh viện (admin or hospital users)
        if (isAdminUser() || isHospitalUser()) {
          navigate("/staff/create-hospital-account");
        } else {
          api.warning({
            message: "Không có quyền truy cập",
            description: "Bạn không có quyền truy cập chức năng này.",
            placement: "topRight",
            duration: 3,
          });
        }
        break;
      case "14": // Tài khoản bệnh viện (admin or hospital users)
        if (isAdminUser() || isHospitalUser()) {
          navigate("/staff/hospital-accounts");
        } else {
          api.warning({
            message: "Không có quyền truy cập",
            description: "Bạn không có quyền truy cập chức năng này.",
            placement: "topRight",
            duration: 3,
          });
        }
        break;
      case "15": // Tạo đơn khẩn cấp (admin or hospital users)
        if (isAdminUser() || isHospitalUser()) {
          navigate("/staff/emergency-request");
        } else {
          api.warning({
            message: "Không có quyền truy cập",
            description: "Bạn không có quyền truy cập chức năng này.",
            placement: "topRight",
            duration: 3,
          });
        }
        break;
      case "16": // Duyệt đơn khẩn cấp (admin or hospital users)
        if (isAdminUser() || isHospitalUser()) {
          navigate("/staff/approve-requests");
        } else {
          api.warning({
            message: "Không có quyền truy cập",
            description: "Bạn không có quyền truy cập chức năng này.",
            placement: "topRight",
            duration: 3,
          });
        }
        break;
      case "17": // Lịch sử tạo đơn (hospital users only)
        if (isHospitalUser()) {
          navigate("/staff/request-history");
        } else {
          api.warning({
            message: "Không có quyền truy cập",
            description: "Bạn không có quyền truy cập chức năng này.",
            placement: "topRight",
            duration: 3,
          });
        }
        break;
      default:
        break;
    }
  };

  // Sidebar items with sections - different based on user role
  const sidebarItems = (() => {
    // For hospital users (roleId = 4), only show hospital and profile sections
    if (isHospitalUser()) {
      return [
        {
          type: "group",
          label: "BỆNH VIỆN",
          children: [
            getItem("Tạo đơn khẩn cấp", "15", <ExclamationCircleOutlined />),
            getItem("Lịch sử tạo đơn", "17", <HistoryOutlined />),
          ],
        },
        {
          type: "group",
          label: "CÀI ĐẶT",
          children: [
            // getItem("Hồ sơ", "6", <UserOutlined />),
            getItem("Đổi mật khẩu", "7", <SettingOutlined />),
            getItem("Trợ giúp", "8", <QuestionCircleOutlined />),
          ],
        },
      ];
    }

    // For admin and staff users, show full menu
    return [
      {
        type: "group",
        label: "QUẢN LÝ",
        children: [
          getItem("Lịch đặt hiến", "1", <PieChartOutlined />),
          // Only show user management for admin users
          ...(isAdminUser()
            ? [getItem("Danh sách người hiến", "2", <UserOutlined />)]
            : []),
          // Only show staff management for admin users
          ...(isAdminUser()
            ? [
                getItem("Danh sách nhân viên", "9", <UsergroupAddOutlined />),
                getItem(
                  "Tạo tài khoản nhân viên",
                  "10",
                  <PlusCircleOutlined />
                ),
              ]
            : []),
          getItem("Quản lý túi máu", "3", <DesktopOutlined />),
          getItem("Hồ sơ người hiến", "4", <FileOutlined />, [
            getItem("Toàn bộ hồ sơ", "4-1", <DatabaseOutlined />),
            // getItem("Tạo hồ sơ mới", "4-2", <PlusCircleOutlined />),
          ]),
          // Only show reports for admin users
          ...(isAdminUser()
            ? [getItem("Báo cáo thống kê", "5", <TeamOutlined />)]
            : []),
        ],
      },
      // Only show hospital management section for admin users
      ...(isAdminUser()
        ? [
            {
              type: "group",
              label: "BỆNH VIỆN",
              children: [
                getItem("Danh sách bệnh viện", "11", <BankOutlined />),
                getItem("Đăng ký bệnh viện", "12", <HomeOutlined />),
                getItem("Tạo tài khoản bệnh viện", "13", <SafetyOutlined />),
                getItem("Tài khoản bệnh viện", "14", <AccountBookOutlined />),
                getItem("Duyệt đơn khẩn cấp", "16", <AuditOutlined />),
              ],
            },
          ]
        : []),
      {
        type: "group",
        label: "CÀI ĐẶT",
        children: [
          getItem("Hồ sơ cá nhân", "6", <UserOutlined />),
          getItem("Đổi mật khẩu", "7", <LockOutlined />),
          getItem("Trợ giúp", "8", <QuestionCircleOutlined />),
        ],
      },
    ];
  })();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      className="staff-sidebar"
      width={280}
      collapsedWidth={64}
      trigger={null}
    >
      {contextHolder}
      <div className="staff-header">
        {!collapsed && (
          <div className="staff-logo">
            <img
              src="/images/new-logo.png"
              alt="Healthcare Logo"
              className="healthcare-logo"
            />
          </div>
        )}
        <div
          className="hamburger-trigger"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCollapse(!collapsed);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onCollapse(!collapsed);
            }
          }}
        >
          <MenuOutlined />
        </div>
      </div>

      <Menu
        theme="light"
        selectedKeys={getSelectedKey()}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        mode="inline"
        inlineCollapsed={collapsed}
        items={sidebarItems}
        className="staff-menu"
        onClick={handleMenuClick}
      />

      <div className="sidebar-logout">
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="logout-button"
          block
        >
          {!collapsed && "Đăng xuất"}
        </Button>
      </div>
    </Sider>
  );
};

export default StaffSidebar;
