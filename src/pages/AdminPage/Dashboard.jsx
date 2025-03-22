import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Divider } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import { getAllUsers } from '../../api/apis';
import moment from 'moment';
import './Dashboard.css';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    activeUsers: 0,
    recentUsers: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers(0, 100);
      if (result.success) {
        const userData = result.data;
        setUsers(userData);
        
        // Tính toán các thống kê
        const now = moment();
        const recentDays = 7; // Số ngày để xác định tài khoản mới
        
        setStats({
          totalUsers: userData.length,
          adminUsers: userData.filter(user => user.account_type === "1").length,
          activeUsers: userData.filter(user => user.is_active === 1).length,
          recentUsers: userData.filter(user => 
            moment(user.created_at).isAfter(now.clone().subtract(recentDays, 'days'))
          ).length
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Lấy 5 người dùng đăng nhập gần đây nhất
  const getRecentUsers = () => {
    return [...users]
      .filter(user => user.last_login)
      .sort((a, b) => moment(b.last_login) - moment(a.last_login))
      .slice(0, 5);
  };

  const recentLoginColumns = [
    {
      title: 'Tên người dùng',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Đăng nhập gần nhất',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (text) => moment(text).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'Loại tài khoản',
      dataIndex: 'account_type',
      key: 'account_type',
      render: (text) => text === "1" ? "Admin" : "User"
    }
  ];

  return (
    <div className="admin-dashboard">
      <Title level={4}>
        Tổng quan hệ thống
      </Title>
      <Text type="secondary" className="dashboard-description">
        Thống kê và dữ liệu tổng hợp về người dùng và hoạt động trong hệ thống.
      </Text>
      <Divider />
      
      {/* Thống kê */}
      <Row gutter={[16, 16]} className="stat-cards">
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng số tài khoản"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Tài khoản admin"
              value={stats.adminUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Tài khoản hoạt động"
              value={stats.activeUsers}
              prefix={<MailOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Tài khoản mới (7 ngày)"
              value={stats.recentUsers}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Đăng nhập gần đây */}
      <Card 
        title="Đăng nhập gần đây" 
        className="recent-logins-card"
        loading={loading}
      >
        <Table
          columns={recentLoginColumns}
          dataSource={getRecentUsers()}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;