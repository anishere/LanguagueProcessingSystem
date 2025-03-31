import { useState, useEffect } from 'react';
import { Table, Tag, DatePicker, Button, Space, Card, Typography, Select, Row, Col, Empty, Input } from 'antd';
import { SearchOutlined, ReloadOutlined, DollarOutlined, FilterOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { getAllCreditHistory } from '../../../api/apis';
import adminTheme from '../theme';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CreditHistoryAllTable = ({ onDataChanged }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [dateRange, setDateRange] = useState(null);
  const [transactionType, setTransactionType] = useState(null);
  const [searchUsername, setSearchUsername] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);

  // Lấy tất cả lịch sử giao dịch khi component mount
  useEffect(() => {
    fetchAllCreditHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  // Hàm lấy tất cả lịch sử giao dịch
  const fetchAllCreditHistory = async () => {
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
      
      const result = await getAllCreditHistory(
        skip,
        pagination.pageSize,
        'desc',
        startDate,
        endDate,
        transactionType,
        searchUsername || null
      );

      if (result.success) {
        setHistory(result.items);
        setPagination(prev => ({
          ...prev,
          total: result.total
        }));
        
        // Cập nhật tổng doanh thu và tổng sử dụng từ API response
        setTotalRevenue(result.totalAmount || 0);
        setTotalUsage(result.totalUsage || 0);
        
        // Thông báo cho component cha biết dữ liệu đã thay đổi
        if (onDataChanged) {
          onDataChanged();
        }
      } else {
        console.error("Lỗi khi lấy lịch sử:", result.error);
        setHistory([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử giao dịch:", error);
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

  // Render tag cho loại giao dịch
  const renderTransactionTypeTag = (type) => {
    let color = 'blue';
    let text = type;

    if (type === 'purchase') {
      color = adminTheme.success;
      text = 'Nạp tiền';
    } else if (type === 'subtract') {
      color = adminTheme.error;
      text = 'Trừ tiền';
    } else if (type === 'usage') {
      color = adminTheme.warning;
      text = 'Sử dụng dịch vụ';
    }

    return <Tag color={color}>{text}</Tag>;
  };
  
  // Xử lý khi thay đổi khoảng thời gian
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };
  
  // Xử lý khi thay đổi loại giao dịch
  const handleTransactionTypeChange = (value) => {
    setTransactionType(value);
  };
  
  // Xử lý khi thay đổi tìm kiếm theo tên
  const handleUsernameSearch = (e) => {
    setSearchUsername(e.target.value);
  };
  
  // Xử lý khi nhấn nút tìm kiếm
  const handleSearch = () => {
    // Reset về trang 1 khi tìm kiếm
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
    fetchAllCreditHistory();
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
      render: (text, record) => text || `User ID: ${record.user_id}`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => {
        const isPositive = record.transaction_type === 'purchase';
        return (
          <span style={{ 
            color: isPositive ? adminTheme.success : adminTheme.secondaryColor, 
            fontWeight: 'bold' 
          }}>
            {isPositive ? '+' : '-'}{Math.abs(amount).toLocaleString()}
          </span>
        );
      },
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: renderTransactionTypeTag,
    },
    {
      title: 'Phương thức',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => {
        // Kiểm tra xem phương thức có chứa thông tin admin không
        if (method && method.startsWith('admin:')) {
          const adminName = method.split(':')[1];
          return <Tag color={adminTheme.secondaryDark}>Admin: {adminName}</Tag>;
        }
        
        // Xử lý các phương thức khác
        let color = adminTheme.gray500;
        let text = method || 'Không xác định';
        
        switch (method) {
          case 'admin':
            color = adminTheme.secondaryDark;
            text = 'Admin';
            break;
          case 'bank_transfer':
            color = adminTheme.primaryColor;
            text = 'Chuyển khoản';
            break;
          case 'credit_card':
            color = adminTheme.warning;
            text = 'Thẻ tín dụng';
            break;
          case 'e_wallet':
            color = adminTheme.info;
            text = 'Ví điện tử';
            break;
          case 'promotional':
            color = adminTheme.secondaryColor;
            text = 'Khuyến mãi';
            break;
          case 'payos':
            color = adminTheme.success;
            text = 'Payos';
            break;
          default:
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
  
  // Format tiền Việt Nam
  const formatCurrency = (value) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <div className="credit-history">
      <Card className="credit-history-card admin-card">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <Title level={4} style={{ margin: 0 }}>
              <DollarOutlined style={{ color: adminTheme.primaryColor }} /> Tất cả giao dịch Credits
            </Title>
            <Text type="secondary">
              Xem tất cả lịch sử giao dịch credits của người dùng trong hệ thống.
            </Text>
          </Col>
          <Col xs={12} md={6}>
            <div className="statistic-card" style={{ borderColor: adminTheme.success }}>
              <Text type="secondary">Tổng nạp vào</Text>
              <Title level={4} style={{ color: adminTheme.success, margin: '8px 0 0 0' }}>
                {formatCurrency(totalRevenue)}
              </Title>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="statistic-card" style={{ borderColor: adminTheme.secondaryColor }}>
              <Text type="secondary">Tổng sử dụng</Text>
              <Title level={4} style={{ color: adminTheme.secondaryColor, margin: '8px 0 0 0' }}>
                {formatCurrency(totalUsage)}
              </Title>
            </div>
          </Col>
        </Row>
        
        {/* Form tìm kiếm */}
        <Row gutter={[16, 16]} className="filter-row" style={{ marginTop: 16, marginBottom: 16 }}>
          <Col xs={24} sm={12} md={5}>
            <Input
              placeholder="Tìm theo tên người dùng"
              value={searchUsername}
              onChange={handleUsernameSearch}
              suffix={<SearchOutlined style={{ color: adminTheme.primaryColor }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={7}>
            <RangePicker 
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Loại giao dịch"
              style={{ width: '100%' }}
              onChange={handleTransactionTypeChange}
              allowClear
            >
              <Option value="purchase">Nạp tiền</Option>
              <Option value="usage">Sử dụng dịch vụ</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={7}>
            <Space>
              <Button 
                type="primary" 
                onClick={handleSearch}
                icon={<FilterOutlined />}
                style={{ backgroundColor: adminTheme.primaryColor, borderColor: adminTheme.primaryColor }}
              >
                Lọc dữ liệu
              </Button>
              <Button 
                onClick={fetchAllCreditHistory}
                icon={<ReloadOutlined />}
                style={{ borderColor: adminTheme.primaryColor, color: adminTheme.primaryColor }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
        
        {history.length === 0 && !loading ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="Không có dữ liệu giao dịch" 
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
            className="admin-table"
          />
        )}
      </Card>
    </div>
  );
};

CreditHistoryAllTable.propTypes = {
  onDataChanged: PropTypes.func
};

CreditHistoryAllTable.defaultProps = {
  onDataChanged: null
};

export default CreditHistoryAllTable; 