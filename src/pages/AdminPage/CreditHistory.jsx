/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Typography, Divider, message } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { getAllUsers } from '../../api/apis';
import CreditHistoryTable from './components/CreditHistoryTable';
import './CreditHistory.css';

const { Title, Text } = Typography;

const CreditHistory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0
  });

  // Lấy danh sách người dùng khi component mount
  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hàm lấy danh sách người dùng - Cập nhật theo logic từ UserManagement.jsx
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const skip = (pagination.current - 1) * pagination.pageSize;
      const result = await getAllUsers(skip, pagination.pageSize);
      
      if (result.success) {
        setUsers(result.data);
        // Cập nhật tổng số bản ghi nếu API trả về
        if (result.total) {
          setPagination(prev => ({ ...prev, total: result.total }));
        }
        console.log("Dữ liệu người dùng:", result);
      } else {
        message.error('Không thể tải danh sách tài khoản');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách tài khoản:', error);
      message.error('Đã xảy ra lỗi khi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-credit-history">
      <Title level={4}>
        <HistoryOutlined /> Lịch sử giao dịch Credits
      </Title>
      <Text type="secondary" className="credit-history-description">
        Tra cứu lịch sử nạp tiền, trừ tiền và các giao dịch credits của người dùng trong hệ thống.
      </Text>
      <Divider />

      <CreditHistoryTable allUsers={users} />
    </div>
  );
};

export default CreditHistory;