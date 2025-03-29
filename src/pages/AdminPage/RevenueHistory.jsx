import { Typography, Divider } from 'antd';
import { FundOutlined } from '@ant-design/icons';
import RevenueHistoryTable from './components/RevenueHistoryTable';
import './RevenueHistory.css';

const { Title, Text } = Typography;

const RevenueHistory = () => {
  return (
    <div className="admin-revenue-history">
      <Title level={4}>
        <FundOutlined /> Thống kê doanh thu
      </Title>
      <Text type="secondary" className="revenue-history-description">
        Xem thống kê tất cả các giao dịch nạp tiền và tổng doanh thu của hệ thống.
      </Text>
      <Divider />

      <RevenueHistoryTable />
    </div>
  );
};

export default RevenueHistory; 