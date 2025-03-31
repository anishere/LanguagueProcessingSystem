/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Divider, message, Card, Row, Col, Select, DatePicker, Space, Button, Tabs, Spin, Alert, Radio } from 'antd';
import { HistoryOutlined, LineChartOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAllUsers, getAllCreditHistory } from '../../api/apis';
import moment from 'moment';
import './CreditHistory.css';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import adminTheme from './theme';
import CreditHistoryAllTable from './components/CreditHistoryAllTable';
import CreditHistoryTable from './components/CreditHistoryTable';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const CreditHistory = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [creditTrendData, setCreditTrendData] = useState([]);
  const [chartDateRange, setChartDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [transactionType, setTransactionType] = useState('all');
  const [error, setError] = useState(null);

  // Fetch users list
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch chart data when date range, transaction type or user changes
  useEffect(() => {
    if (activeTab === 'user' && selectedUserId) {
      fetchUserCreditTrend();
    } else if (activeTab === 'all') {
      fetchAllCreditTrend();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, chartDateRange, transactionType, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers(0, 100);
      
      if (result.success) {
        setUsers(result.data);
      } else {
        // Nếu API không thành công, sử dụng danh sách giả làm dự phòng
        const mockUsers = [
          { id: "1", username: "User 1" },
          { id: "2", username: "User 2" },
          { id: "3", username: "User 3" },
          { id: "4", username: "User 4" },
          { id: "5", username: "User 5" }
        ];
        setUsers(mockUsers);
        setError('Không thể lấy danh sách người dùng, đang sử dụng dữ liệu mẫu');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Sử dụng danh sách giả khi có lỗi
      const mockUsers = [
        { id: "1", username: "User 1" },
        { id: "2", username: "User 2" },
        { id: "3", username: "User 3" },
        { id: "4", username: "User 4" },
        { id: "5", username: "User 5" }
      ];
      setUsers(mockUsers);
      setError('Đã xảy ra lỗi khi lấy danh sách người dùng, đang sử dụng dữ liệu mẫu');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelected = useCallback((userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName || '');
  }, []);

  // Fetch credit trend data for a specific user
  const fetchUserCreditTrend = async () => {
    if (!selectedUserId) return;
    
    setChartLoading(true);
    try {
      // Thực hiện call API cho user cụ thể
      // Xử lý dữ liệu để hiện thị biểu đồ
      setChartLoading(false);
    } catch (error) {
      console.error('Error fetching user credit trend:', error);
      setChartLoading(false);
    }
  };

  // Fetch credit trend data for all users
  const fetchAllCreditTrend = async () => {
    setChartLoading(true);
    try {
      const startDate = chartDateRange[0].format('YYYY-MM-DD');
      const endDate = chartDateRange[1].format('YYYY-MM-DD');
      const txType = transactionType === 'all' ? null : transactionType;
      
      const result = await getAllCreditHistory(0, 1000, 'asc', startDate, endDate, txType);
      
      if (result.success) {
        const processedData = processTransactionData(result.items);
        setCreditTrendData(processedData);
      } else {
        console.error("Lỗi khi lấy dữ liệu xu hướng:", result.error);
        setCreditTrendData([]);
      }
    } catch (error) {
      console.error('Error fetching all credit trend:', error);
      setCreditTrendData([]);
    } finally {
      setChartLoading(false);
    }
  };

  // Process transaction data for chart display
  const processTransactionData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Group transactions by date
    const groupedByDate = {};
    
    transactions.forEach(tx => {
      const date = moment(tx.created_at).format('YYYY-MM-DD');
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = { date, purchase: 0, usage: 0 };
      }
      
      if (tx.transaction_type === 'purchase') {
        groupedByDate[date].purchase += tx.amount;
      } else if (tx.transaction_type === 'usage') {
        groupedByDate[date].usage += Math.abs(tx.amount);
      }
    });
    
    // Convert to array and sort by date
    const result = Object.values(groupedByDate);
    result.sort((a, b) => moment(a.date).diff(moment(b.date)));
    
    return result;
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'all') {
      setSelectedUserId(null);
      setSelectedUserName('');
    }
  };

  const handleChartDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setChartDateRange(dates);
    }
  };

  const handleTransactionTypeChange = (e) => {
    setTransactionType(e.target.value);
  };

  const renderChart = () => {
    if (chartLoading) {
      return (
        <div className="chart-placeholder">
          <Spin size="large" />
        </div>
      );
    }

    if (creditTrendData.length === 0) {
      return (
        <div className="chart-placeholder">
          <Alert
            message="Không có dữ liệu"
            description="Không có dữ liệu giao dịch trong khoảng thời gian đã chọn."
            type="info"
            showIcon
          />
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={creditTrendData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="purchase"
            name="Nạp vào"
            stroke={adminTheme.success}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="usage"
            name="Sử dụng"
            stroke={adminTheme.secondaryColor}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="admin-page">
      {error && <Alert message={error} type="error" className="admin-alert" closable />}
      
      <Card className="admin-card chart-card">
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} md={12}>
            <Title level={4}>
              Biểu đồ xu hướng giao dịch
              {activeTab === 'user' && selectedUserName && (
                <span className="selected-user-label">
                  - {selectedUserName}
                </span>
              )}
            </Title>
          </Col>
          <Col xs={24} md={12}>
            <Space style={{ float: 'right' }}>
              <RangePicker 
                value={chartDateRange}
                onChange={handleChartDateRangeChange}
                disabled={activeTab === 'user' && !selectedUserId}
              />
              <Radio.Group 
                value={transactionType} 
                onChange={handleTransactionTypeChange}
                disabled={activeTab === 'user' && !selectedUserId}
              >
                <Radio.Button value="all">Tất cả</Radio.Button>
                <Radio.Button value="purchase">Nạp tiền</Radio.Button>
                <Radio.Button value="usage">Sử dụng</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
        </Row>
        
        {renderChart()}
      </Card>
      
      <Tabs activeKey={activeTab} onChange={handleTabChange} type="card" className="admin-tabs">
        <TabPane tab="Tất cả giao dịch" key="all">
          <CreditHistoryAllTable 
            allUsers={users} 
            onDataChanged={() => fetchAllCreditTrend()}
          />
        </TabPane>
        <TabPane tab="Giao dịch theo người dùng" key="user">
          <CreditHistoryTable 
            allUsers={users} 
            onUserSelected={handleUserSelected}
            onDataChanged={() => fetchAllCreditTrend()}
          />
          {!selectedUserId && (
            <Alert
              message="Chọn người dùng"
              description="Vui lòng chọn một người dùng từ danh sách để xem lịch sử giao dịch."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CreditHistory;