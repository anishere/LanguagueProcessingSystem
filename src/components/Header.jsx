// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Layout, Dropdown, Menu, Typography, Divider, Avatar } from 'antd';
import { LogoutOutlined, ProfileOutlined, WalletOutlined, DashboardOutlined, UserOutlined } from '@ant-design/icons';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';
import { getConfig, getCurrentUser } from '../api/apis';
import { useSelector } from 'react-redux';
import { FaLanguage, FaChartBar } from "react-icons/fa";
import { MdImage, MdInsertDriveFile, MdWeb } from "react-icons/md";
import { getCookie, COOKIE_KEYS } from '../settings/cookies';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

// eslint-disable-next-line react/prop-types
const Header = ({ onLogout }) => {
  const [visible, setVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [logo, setLogo] = useState('');

  // Lấy user_id từ cookie
  const storedUser = getCookie(COOKIE_KEYS.USER) || {};
  const userId = storedUser.user_id;

  const { actionFlag } = useSelector((state) => state.action);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userId) {
        try {
          const response = await getCurrentUser(userId);
          if (response.success) {
            setUserInfo(response.data);
          } else {
            console.error("Lỗi khi lấy thông tin người dùng:", response.error);
          }
        } catch (error) {
          console.error("Lỗi khi gọi API:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.error("Không tìm thấy user_id trong cookie");
        setLoading(false);
      }
    };
    fetchUserInfo();

    const fetchConfig = async () => {
      try {
        const response = await getConfig();
        if (response.success) {
          setLogo(response.data.logo_link);
        } else {
          console.error("Lỗi khi lấy thông tin người dùng:", response.error);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [userId, actionFlag]); 

  // Xử lý đăng xuất
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Menu dropdown khi hover vào avatar
  const userMenu = (
    <Menu className="user-dropdown-menu">
      <Menu.Item key="username" disabled className="username-item text-center">
        <Text strong>{userInfo?.username || 'Người dùng'}</Text>
      </Menu.Item>
      <Menu.Item key="credits" icon={<WalletOutlined />}>
        <Link to='/payment' strong>
        {userInfo?.credits !== undefined ? Number(userInfo.credits).toLocaleString('vi-VN') : 'Not found'}
        </Link>
      </Menu.Item>
      <Divider style={{ margin: '4px 0' }} />
      {userInfo?.account_type && userInfo.account_type === '1' && (
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          <Link className="no-direction" to="/admin">Dashboard</Link>
        </Menu.Item>
      )}
      <Menu.Item key="profile" icon={<ProfileOutlined />}>
        <Link className="no-direction" to="/profile">Hồ sơ</Link>
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout} icon={<LogoutOutlined />}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader className="site-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <img 
              src={logo || "https://cdn-icons-png.flaticon.com/512/5968/5968764.png"} 
              alt="An" 
              className="logo-image" 
            />
          </Link>
          
          <div className="main-navigation">
            <div className="tabs-container header-tabs">
              <NavLink to="/text" className={({ isActive }) => 
                `tab-item ${isActive ? 'active' : ''}`}>
                <FaLanguage className="tab-icon" />
                <span className="tab-text">Chữ</span>
              </NavLink>
              
              <NavLink to="/analysis" className={({ isActive }) => 
                `tab-item ${isActive ? 'active' : ''}`}>
                <FaChartBar className="tab-icon" />
                <span className="tab-text">Phân tích</span>
              </NavLink>
              
              <NavLink to="/file" className={({ isActive }) => 
                `tab-item ${isActive ? 'active' : ''}`}>
                <MdInsertDriveFile className="tab-icon" />
                <span className="tab-text">Các tài liệu</span>
              </NavLink>
              
              <NavLink to="/image" className={({ isActive }) => 
                `tab-item ${isActive ? 'active' : ''}`}>
                <MdImage className="tab-icon" />
                <span className="tab-text">Hình ảnh</span>
              </NavLink>
              
              <NavLink to="/web" className={({ isActive }) => 
                `tab-item ${isActive ? 'active' : ''}`}>
                <MdWeb className="tab-icon" />
                <span className="tab-text">Websites</span>
              </NavLink>
            </div>
          </div>
        </div>

        <div className="header-right">
          {loading ? (
            <Text>Đang tải...</Text>
          ) : (
            <Dropdown
              overlay={userMenu}
              trigger={['hover']}
              onVisibleChange={setVisible}
              visible={visible}
              placement="bottomRight"
            >
              <div className="avatar-container">
                <Avatar
                  icon={<UserOutlined />}
                  size="large"
                  className="user-avatar"
                />
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;