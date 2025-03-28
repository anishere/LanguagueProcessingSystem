// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Layout, Dropdown, Avatar, Menu, Typography, Divider } from 'antd';
import { UserOutlined, LogoutOutlined, ProfileOutlined, WalletOutlined, DashboardOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Header.css';
import { getConfig, getCurrentUser } from '../api/apis'; // Import hàm getCurrentUser
import { useSelector } from 'react-redux';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

// eslint-disable-next-line react/prop-types
const Header = ({ onLogout }) => {
  const [visible, setVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // State để lưu thông tin người dùng từ API
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu

  const [logo, setLogo] = useState('');

  // Lấy user_id từ localStorage
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
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
        console.error("Không tìm thấy user_id trong localStorage");
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
        <Link to='/payment' strong>{userInfo?.credits !== undefined ? userInfo.credits : 'Not found'}</Link>
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
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Logo" className="logo-image" />
            <Title level={4} className="logo-text"></Title>
          </Link>
        </div>

        <div className="header-user">
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