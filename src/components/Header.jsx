// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Layout, Dropdown, Avatar, Menu, Typography, Divider } from 'antd';
import { UserOutlined, LogoutOutlined, ProfileOutlined, WalletOutlined, DashboardOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from '../assets/imgs/logo.png'

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

// eslint-disable-next-line react/prop-types
const Header = ({ onLogout }) => {
  const [visible, setVisible] = useState(false);
  
  // Lấy thông tin người dùng từ localStorage
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const username = userInfo.username || 'Người dùng';
  const credits = userInfo.credits || 'Not found';
  const account_type = userInfo.account_type;
  
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
        <Text strong>{username}</Text>
      </Menu.Item>
      <Menu.Item key="credits" icon={<WalletOutlined />}>
      <Text strong>{credits}</Text>
      </Menu.Item>
      <Divider style={{ margin: '4px 0' }} />
      {account_type && (account_type == '1') &&
      <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
       <Link className='no-direction' to="/admin" >Dash board</Link>
      </Menu.Item>
      }
      <Menu.Item key="profile" icon={<ProfileOutlined />}>
        <Link className='no-direction' to="/profile" >Hồ sơ</Link>
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
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;