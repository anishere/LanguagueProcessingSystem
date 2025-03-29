import { Typography, Divider, Card } from 'antd';
import { FundOutlined, LineChartOutlined } from '@ant-design/icons';
import RevenueHistoryTable from './components/RevenueHistoryTable';
import './RevenueHistory.css';
import { useState, useEffect } from 'react';
import { getRevenueHistory } from '../../api/apis';
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
import moment from 'moment';
import adminTheme from './theme';

const { Title, Text } = Typography;

const RevenueHistory = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const result = await getRevenueHistory(0, 1000);
      if (result.success) {
        // Xử lý dữ liệu doanh thu theo tháng
        const revenueItems = result.items || [];
        
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
      console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Format tiền Việt Nam
  const formatCurrency = (value) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <div className="admin-revenue-history">
      <div className="revenue-header">
        <div>
          <Title level={4}>
            <FundOutlined /> Thống kê doanh thu
          </Title>
          <Text type="secondary" className="revenue-history-description">
            Xem thống kê tất cả các giao dịch nạp tiền và tổng doanh thu của hệ thống.
          </Text>
        </div>
      </div>
      <Divider />
      
      {/* Biểu đồ doanh thu theo tháng */}
      <Card 
        title={
          <div className="chart-title">
            <LineChartOutlined /> Doanh thu theo tháng
          </div>
        } 
        loading={loading}
        className="revenue-chart-card"
        style={{ marginBottom: '16px' }}
      >
        <ResponsiveContainer width="100%" height={400}>
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
              strokeWidth={2}
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      
      {/* Bảng lịch sử doanh thu */}
      <RevenueHistoryTable onDataChanged={fetchRevenueData} />
    </div>
  );
};

export default RevenueHistory; 