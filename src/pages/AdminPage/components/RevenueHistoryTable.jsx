import { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, DatePicker, Row, Col, Statistic, Space, Button, Empty } from 'antd';
import { ReloadOutlined, DollarOutlined, FundOutlined } from '@ant-design/icons';
import { getRevenueHistory } from '../../../api/apis';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const RevenueHistoryTable = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dateRange, setDateRange] = useState(null);

  // Lấy lịch sử giao dịch khi component mount hoặc khi pagination thay đổi
  useEffect(() => {
    fetchRevenueHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const fetchRevenueHistory = async () => {
    setLoading(true);
    try {
      const skip = (pagination.current - 1) * pagination.pageSize;
      
      // Chuẩn bị tham số về ngày nếu có chọn khoảng thời gian
      let startDate = null;
      let endDate = null;
      
      if (dateRange && dateRange.length === 2) {
        startDate = dateRange[0].format('YYYY-MM-DD');
        endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      const result = await getRevenueHistory(
        skip,
        pagination.pageSize,
        'desc',
        startDate,
        endDate
      );

      if (result.success) {
        setHistory(result.items);
        setTotalRevenue(result.totalRevenue);
        setPagination(prev => ({
          ...prev,
          total: result.total
        }));
      } else {
        console.error("Lỗi khi lấy lịch sử doanh thu:", result.error);
        setHistory([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử doanh thu:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi phân trang
  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
    });
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Định dạng tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Xử lý khi thay đổi khoảng thời gian
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Xử lý khi nhấn tìm kiếm
  const handleSearch = () => {
    // Reset trang về 1 khi tìm kiếm
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    fetchRevenueHistory();
  };

  // Cấu hình các cột cho bảng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Người dùng',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          {formatCurrency(amount)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Phương thức',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => {
        // Kiểm tra xem phương thức có chứa thông tin admin không
        if (method && method.startsWith('admin:')) {
          const adminName = method.split(':')[1];
          return <Tag color="purple">Admin: {adminName}</Tag>;
        }
        
        // Xử lý các phương thức khác
        let color = 'default';
        let text = method || 'Không xác định';
        
        switch (method) {
          case 'admin':
            color = 'purple';
            text = 'Admin';
            break;
          case 'bank_transfer':
            color = 'blue';
            text = 'Chuyển khoản';
            break;
          case 'credit_card':
            color = 'gold';
            text = 'Thẻ tín dụng';
            break;
          case 'e_wallet':
            color = 'cyan';
            text = 'Ví điện tử';
            break;
          case 'promotional':
            color = 'magenta';
            text = 'Khuyến mãi';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: formatDateTime,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend',
    },
  ];

  return (
    <div className="revenue-history">
      <Card className="revenue-history-card">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Title level={4}>
              <FundOutlined /> Lịch sử doanh thu
            </Title>
            <Text type="secondary">
              Danh sách tất cả các giao dịch nạp tiền và doanh thu của hệ thống.
            </Text>
          </Col>
          <Col xs={24} md={8}>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              formatter={(value) => `${new Intl.NumberFormat('vi-VN').format(value)} VND`}
            />
          </Col>
        </Row>
        
        {/* Form tìm kiếm */}
        <Row gutter={[16, 16]} className="filter-row" style={{ marginTop: 16, marginBottom: 16 }}>
          <Col xs={24} sm={12}>
            <Space>
              <RangePicker onChange={handleDateRangeChange} />
              <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
              <Button icon={<ReloadOutlined />} onClick={fetchRevenueHistory}>Làm mới</Button>
            </Space>
          </Col>
        </Row>
        
        {history.length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có dữ liệu doanh thu"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={history}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            loading={loading}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>
    </div>
  );
};

export default RevenueHistoryTable; 