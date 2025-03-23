/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Table, Tag, Input, Button, Space, Card, Typography, Select, DatePicker, Row, Col, Empty, Alert } from 'antd';
import { SearchOutlined, ReloadOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { getCreditHistory } from '../../../api/apis';

const { Title, Text } = Typography;
const { Option } = Select;

const CreditHistoryTable = ({ allUsers }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // State cho ID người dùng được chọn
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userIdInput, setUserIdInput] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Lấy lịch sử giao dịch khi selectedUserId thay đổi
  useEffect(() => {
    if (selectedUserId) {
      fetchCreditHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, pagination.current, pagination.pageSize]);

  const fetchCreditHistory = async () => {
    if (!selectedUserId) {
      setHistory([]);
      setPagination(prev => ({ ...prev, total: 0 }));
      return;
    }
    
    setLoading(true);
    try {
      const skip = (pagination.current - 1) * pagination.pageSize;
      const result = await getCreditHistory(
        selectedUserId,
        skip,
        pagination.pageSize,
        'desc'
      );

      if (result.success) {
        setHistory(result.items);
        setPagination(prev => ({
          ...prev,
          total: result.total
        }));
        setHasSearched(true);
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

  // Tìm tên người dùng dựa vào ID
  const getUsernameById = (userId) => {
    const user = allUsers.find(user => user.id === userId);
    return user ? user.username : `User ID: ${userId}`;
  };

  // Xử lý khi chọn người dùng từ dropdown
  const handleUserSelect = (value) => {
    setSelectedUserId(value);
    // Nếu chọn từ dropdown, cập nhật input
    const userId = value ? value.toString() : '';
    setUserIdInput(userId);
    
    // Reset trang về 1 khi chọn người dùng mới
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  // Xử lý khi nhập trực tiếp ID
  const handleUserIdInputChange = (e) => {
    setUserIdInput(e.target.value);
  };

  // Xử lý khi nhấn tìm kiếm
  const handleSearch = () => {
    // Nếu input rỗng, reset
    if (!userIdInput.trim()) {
      setSelectedUserId(null);
      setHistory([]);
      setHasSearched(false);
      return;
    }
    
    // Chuyển đổi input thành số
    const userId = parseInt(userIdInput, 10);
    if (isNaN(userId)) {
      // Nếu không phải số, hiển thị thông báo lỗi
      return;
    }
    
    setSelectedUserId(userId);
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
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
      color = 'green';
      text = 'Nạp tiền';
    } else if (type === 'subtract') {
      color = 'red';
      text = 'Trừ tiền';
    } else if (type === 'usage') {
      color = 'orange';
      text = 'Sử dụng dịch vụ';
    }

    return <Tag color={color}>{text}</Tag>;
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
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userId) => getUsernameById(userId),
    },
    {
      title: 'Số lượng',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => {
        const isPositive = record.transaction_type === 'purchase';
        return (
          <span style={{ color: isPositive ? '#52c41a' : '#f5222d', fontWeight: 'bold' }}>
            {isPositive ? '+' : '-'}{amount.toLocaleString()}
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
          return <Tag color="purple">Admin: {adminName}</Tag>;
        }
        
        // Xử lý các phương thức khác
        let color = 'default';
        let text = method;
        
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
    <div className="credit-history">
      <Card className="credit-history-card">
        <Title level={4}>
          <DollarOutlined /> Lịch sử giao dịch Credits
        </Title>
        <Text type="secondary">
          Nhập ID tài khoản hoặc chọn người dùng từ danh sách để xem lịch sử giao dịch credits.
        </Text>
        
        {/* Form tìm kiếm */}
        <Row gutter={[16, 16]} className="filter-row" style={{ marginTop: 16, marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Input
              placeholder="Nhập ID người dùng"
              value={userIdInput}
              onChange={handleUserIdInputChange}
              prefix={<UserOutlined />}
              type="number"
              min={1}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Hoặc chọn người dùng"
              style={{ width: '100%' }}
              allowClear
              onChange={handleUserSelect}
              value={selectedUserId}
              showSearch
              optionFilterProp="children"
            >
              {allUsers.map(user => (
                <Option key={user.id} value={user.id}>{user.username} (ID: {user.id})</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={12} lg={14}>
            <Space>
              <Button 
                type="primary"
                onClick={handleSearch}
                icon={<SearchOutlined />}
              >
                Tìm kiếm
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCreditHistory}
                loading={loading}
                disabled={!selectedUserId}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
        
        {/* Hiển thị thông tin người dùng đang xem */}
        {selectedUserId && (
          <Alert
            message={
              <span>
                Đang xem lịch sử giao dịch của người dùng: <strong>{getUsernameById(selectedUserId)}</strong> (ID: {selectedUserId})
              </span>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {/* Bảng lịch sử hoặc thông báo chưa chọn người dùng */}
        {selectedUserId ? (
          <Table
            columns={columns}
            dataSource={history}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: hasSearched ? 'Không có dữ liệu giao dịch' : 'Vui lòng chọn người dùng để xem lịch sử'
            }}
          />
        ) : (
          <Empty 
            description="Vui lòng nhập ID hoặc chọn người dùng để xem lịch sử giao dịch" 
            style={{ padding: 40 }}
          />
        )}
      </Card>
    </div>
  );
};

CreditHistoryTable.propTypes = {
  allUsers: PropTypes.array.isRequired
};

export default CreditHistoryTable;