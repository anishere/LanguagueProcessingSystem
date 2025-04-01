/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Layout, Menu, Button, Breadcrumb, Typography, Dropdown, Avatar, theme, Space } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HistoryOutlined,
  FundOutlined
} from '@ant-design/icons';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import UserManagement from './UserManagement';
import AdminDashboard from './Dashboard';
import CreditHistory from './CreditHistory';
import RevenueHistory from './RevenueHistory';
import Settings from './Settings';  // Import component Settings mới
import './Admin.css';
import { getCookie, COOKIE_KEYS } from '../../settings/cookies';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

// eslint-disable-next-line react/prop-types
const Admin = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  
  // Lấy thông tin user từ cookies
  const userInfo = getCookie(COOKIE_KEYS.USER) || {};
  
  // Xử lý đăng xuất
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };
  
  // Xác định key active dựa trên path hiện tại
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin') return ['dashboard'];
    if (path.includes('/admin/users')) return ['users'];
    if (path.includes('/admin/credits/history')) return ['credits-history'];
    if (path.includes('/admin/revenue')) return ['revenue'];
    if (path.includes('/admin/settings')) return ['settings'];
    return ['dashboard'];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        className="admin-sider"
      >
        <div className="admin-logo">
          {!collapsed ? (
            <Title level={4} style={{ margin: '16px 0', color: token.colorPrimary, padding: '0 24px' }}>
              Admin Portal
            </Title>
          ) : (
            <div style={{ height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <UserOutlined style={{ fontSize: '1.5rem', color: token.colorPrimary }} />
            </div>
          )}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={getSelectedKey()}
          style={{ borderRight: 0 }}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: <Link to="/admin">Dashboard</Link>,
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: <Link to="/admin/users">Quản lý tài khoản</Link>,
            },
            {
              key: 'credits-history',
              icon: <HistoryOutlined />,
              label: <Link to="/admin/credits/history">Lịch sử Credits</Link>,
            },
            {
              key: 'revenue',
              icon: <FundOutlined />,
              label: <Link to="/admin/revenue">Thống kê doanh thu</Link>,
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: <Link to="/admin/settings">Cài đặt</Link>,
            },
            {
              key: 'app',
              icon: <LogoutOutlined />,
              label: <Link to="/">Quay lại ứng dụng</Link>,
            }
          ]}
        />
      </Sider>
      
      <Layout>
        <Header className="admin-header" style={{ background: token.colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div className="admin-header-right">
            <Dropdown
              menu={{
                items: [
                  {
                    key: '1',
                    label: 'Hồ sơ',
                    icon: <UserOutlined />,
                  },
                  {
                    key: '2',
                    label: 'Đăng xuất',
                    icon: <LogoutOutlined />,
                    onClick: handleLogout,
                  },
                ],
              }}
            >
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span className="admin-username">
                  {userInfo?.username || 'Admin'}
                </span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="admin-content">
          <div className="admin-breadcrumb-container">
            <Breadcrumb
              items={[
                { title: 'Admin' },
                {
                  title: location.pathname.includes('/users') 
                    ? 'Quản lý tài khoản' 
                    : (location.pathname.includes('/credits/history') 
                      ? 'Lịch sử Credits'
                      : (location.pathname.includes('/revenue')
                        ? 'Thống kê doanh thu'
                        : (location.pathname.includes('/settings') ? 'Cài đặt' : 'Dashboard')))
                },
              ]}
            />
          </div>
          
          <div className="admin-main-content">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/credits/history" element={<CreditHistory />} />
              <Route path="/revenue" element={<RevenueHistory />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </Content>
        
        <Footer className="admin-footer">
          Translate AI Admin Panel ©{new Date().getFullYear()} - By An
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Admin;