/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Input, Button, Space, Card, Typography, Select, DatePicker, Row, Col, Empty, Alert, message } from 'antd';
import { SearchOutlined, ReloadOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { getCreditHistory } from '../../../api/apis';
import adminTheme from '../theme';

const { Title, Text } = Typography;
const { Option } = Select;

const CreditHistoryTable = ({ allUsers, onDataChanged, onUserSelected }) => {
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

  // Tìm tên người dùng dựa vào ID
  const getUsernameById = (userId) => {
    if (!allUsers || !Array.isArray(allUsers)) {
      return `User ID: ${userId}`;
    }
    const user = allUsers.find(user => user.id === userId);
    return user ? user.username : `User ID: ${userId}`;
  };

  // Xử lý khi chọn người dùng từ dropdown
  const handleUserSelect = useCallback((value) => {
    setSelectedUserId(value);
    if (onUserSelected) {
      onUserSelected(value);
    }
  }, [onUserSelected]);

  // Xử lý khi nhập ID người dùng
  const handleUserIdInputChange = (e) => {
    const value = e.target.value.trim();
    setUserIdInput(value);
    
    // Nếu người dùng xóa hết input, reset selectedUserId
    if (!value) {
      setSelectedUserId(null);
      if (onUserSelected) {
        onUserSelected(null);
      }
    }
  };

  // Xử lý khi nhấn nút tìm kiếm
  const handleSearch = () => {
    let id = selectedUserId;
    
    // Nếu có nhập ID người dùng, ưu tiên sử dụng ID này
    if (userIdInput) {
      id = userIdInput;
      setSelectedUserId(id);
      if (onUserSelected) {
        onUserSelected(id);
      }
    }
    
    // Nếu không có ID nào được chọn, không làm gì cả
    if (!id) {
      message.warning('Vui lòng nhập hoặc chọn ID người dùng');
      return;
    }
    
    fetchCreditHistory();
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
      <Card className="credit-history-card admin-card">
        <Title level={4} style={{ margin: 0 }}>
          <DollarOutlined style={{ color: adminTheme.primaryColor }} /> Lịch sử giao dịch Credits
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
              suffix={<UserOutlined style={{ color: adminTheme.primaryColor }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Chọn người dùng"
              style={{ width: '100%' }}
              onChange={handleUserSelect}
              value={selectedUserId}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {allUsers.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Space>
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                onClick={handleSearch}
                style={{ backgroundColor: adminTheme.primaryColor, borderColor: adminTheme.primaryColor }}
              >
                Tìm kiếm
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchCreditHistory}
                style={{ borderColor: adminTheme.primaryColor, color: adminTheme.primaryColor }}
                disabled={!selectedUserId}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
        
        {!hasSearched ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="Vui lòng chọn người dùng để xem lịch sử giao dịch"
          />
        ) : history.length === 0 && !loading ? (
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

CreditHistoryTable.propTypes = {
  allUsers: PropTypes.array,
  onDataChanged: PropTypes.func,
  onUserSelected: PropTypes.func
};

CreditHistoryTable.defaultProps = {
  allUsers: [],
  onDataChanged: null,
  onUserSelected: null
};

export default CreditHistoryTable;