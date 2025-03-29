import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Divider, Button } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CalendarOutlined, 
  TeamOutlined,
  DollarOutlined,
  LineChartOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { getAllUsers, getRevenueHistory, getCreditHistory } from '../../api/apis';
import moment from 'moment';
import './Dashboard.css';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import adminTheme from './theme';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    activeUsers: 0,
    recentUsers: 0,
    totalRevenue: 0
  });
  const [userActivityData, setUserActivityData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách người dùng
      const userResult = await getAllUsers(0, 100);
      
      // Lấy dữ liệu doanh thu
      const revenueResult = await getRevenueHistory(0, 1000);
      
      // Lấy lịch sử credit
      await getCreditHistory(null, 0, 1000);
      
      if (userResult.success) {
        const userData = userResult.data;
        setUsers(userData);
        
        // Tính toán các thống kê
        const now = moment();
        const recentDays = 7; // Số ngày để xác định tài khoản mới
        
        setStats({
          totalUsers: userData.length,
          adminUsers: userData.filter(user => user.account_type === "1").length,
          activeUsers: userData.filter(user => user.is_active == 1).length,
          recentUsers: userData.filter(user => 
            moment(user.created_at).isAfter(now.clone().subtract(recentDays, 'days'))
          ).length,
          totalRevenue: revenueResult.success ? revenueResult.totalRevenue : 0
        });
        
        // Xử lý dữ liệu biểu đồ hoạt động người dùng
        // Tạo dữ liệu mô phỏng cho biểu đồ hoạt động trong 7 ngày qua
        const activityData = Array(7).fill(0).map((_, index) => {
          const date = moment().subtract(6 - index, 'days');
          const dateStr = date.format('DD/MM');
          
          // Đếm số người dùng đã đăng nhập trong ngày
          const loggedInCount = userData.filter(user => 
            user.last_login && moment(user.last_login).isSame(date, 'day')
          ).length;
          
          // Đếm số người dùng đã đăng ký trong ngày
          const signupCount = userData.filter(user => 
            user.created_at && moment(user.created_at).isSame(date, 'day')
          ).length;
          
          return {
            date: dateStr,
            logins: loggedInCount,
            signups: signupCount
          };
        });
        
        setUserActivityData(activityData);
      }
      
      if (revenueResult.success) {
        // Xử lý dữ liệu doanh thu theo tháng
        const revenueItems = revenueResult.items || [];
        
        // Nhóm doanh thu theo tháng
        const revenueByMonth = revenueItems.reduce((acc, item) => {
          const month = moment(item.created_at).format('MM/YYYY');
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month] += item.amount;
          return acc;
        }, {});
        
        // Chuyển đổi thành mảng cho biểu đồ
        const chartData = Object.keys(revenueByMonth).map(month => ({
          month,
          revenue: revenueByMonth[month]
        })).sort((a, b) => {
          const [monthA, yearA] = a.month.split('/');
          const [monthB, yearB] = b.month.split('/');
          return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
        });
        
        setRevenueData(chartData);
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
      render: (text) => text === "1" ? 
        <span style={{ color: adminTheme.secondaryColor, fontWeight: 'bold' }}>Admin</span> : 
        <span>User</span>
    }
  ];
  
  // Format tiền Việt Nam
  const formatCurrency = (value) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <Title level={4}>
            Tổng quan hệ thống
          </Title>
          <Text type="secondary" className="dashboard-description">
            Thống kê và dữ liệu tổng hợp về người dùng và hoạt động trong hệ thống.
          </Text>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchData} 
          loading={loading}
          className="admin-btn-primary"
        >
          Làm mới
        </Button>
      </div>
      <Divider />
      
      {/* Thống kê */}
      <Row gutter={[16, 16]} className="stat-cards">
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} className="statistic-card statistic-users">
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>Tổng số tài khoản</span>}
              value={stats.totalUsers}
              prefix={<TeamOutlined style={{ color: adminTheme.primaryColor }} />}
              valueStyle={{ color: adminTheme.primaryColor, fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} className="statistic-card statistic-admin">
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>Tài khoản admin</span>}
              value={stats.adminUsers}
              prefix={<UserOutlined style={{ color: adminTheme.secondaryColor }} />}
              valueStyle={{ color: adminTheme.secondaryColor, fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} className="statistic-card statistic-active">
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>Tài khoản hoạt động</span>}
              value={stats.activeUsers}
              prefix={<MailOutlined style={{ color: adminTheme.success }} />}
              valueStyle={{ color: adminTheme.success, fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} className="statistic-card statistic-new">
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>Doanh thu</span>}
              value={stats.totalRevenue}
              prefix={<DollarOutlined style={{ color: adminTheme.info }} />}
              valueStyle={{ color: adminTheme.info, fontWeight: 'bold', fontSize: '28px' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Biểu đồ */}
      <Row gutter={[16, 16]} className="chart-row">
        <Col xs={24}>
          <Card 
            title={
              <div className="chart-title">
                <LineChartOutlined /> Biểu đồ hoạt động người dùng
              </div>
            } 
            className="chart-card"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={userActivityData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="logins" 
                  name="Đăng nhập" 
                  stroke={adminTheme.primaryColor} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="signups" 
                  name="Đăng ký" 
                  stroke={adminTheme.secondaryColor} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
      {/* Biểu đồ doanh thu */}
      {revenueData.length > 0 && (
        <Card 
          title={
            <div className="chart-title">
              <DollarOutlined /> Doanh thu theo tháng
            </div>
          } 
          className="chart-card revenue-chart"
          style={{ marginTop: '16px' }}
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={revenueData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Doanh thu" 
                stroke={adminTheme.success} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
      
      {/* Đăng nhập gần đây */}
      <Card 
        title={
          <div className="recent-login-title">
            <CalendarOutlined /> Đăng nhập gần đây
          </div>
        } 
        className="recent-logins-card admin-table"
        style={{ marginTop: '16px' }}
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