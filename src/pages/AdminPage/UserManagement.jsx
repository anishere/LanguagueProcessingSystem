import { useState, useEffect } from 'react';
import { Typography, Divider, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getAllUsers } from '../../api/apis';

// Import components
import UserManagementHeader from './components/UserManagementHeader';
import UserManagementTable from './components/UserManagementTable';
import AddUserModal from './components/AddUserModal';
import EditUserModal from './components/EditUserModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import CreditsModal from './components/CreditsModal';

import './UserManagement.css';

const { Title, Text } = Typography;

const UserManagement = () => {
  // State cho dữ liệu và loading
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // State cho các modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [creditsModalVisible, setCreditsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [creditOperation, setCreditOperation] = useState('add'); // 'add' hoặc 'subtract'
  
  // Lấy danh sách người dùng khi component mount
  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);
  
  // Hàm lấy danh sách người dùng
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
  
  // Lọc danh sách người dùng theo từ khóa tìm kiếm
  const filteredUsers = searchText
    ? users.filter(user => 
        user.username?.toLowerCase().includes(searchText.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchText.toLowerCase()))
    : users;
  
  // Xử lý thay đổi phân trang
  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
    });
  };
  
  // Handlers for showing modals
  const showEditModal = (user) => {
    setCurrentUser(user);
    setEditModalVisible(true);
  };
  
  const showResetPasswordModal = (user) => {
    setCurrentUser(user);
    setResetPasswordModalVisible(true);
  };
  
  const showCreditsModal = (user, operation = 'add') => {
    setCurrentUser(user);
    setCreditOperation(operation);
    setCreditsModalVisible(true);
  };
  
  return (
    <div className="admin-user-management">
      <Title level={4}>
        <UserOutlined /> Quản lý tài khoản người dùng
      </Title>
      <Text type="secondary" className="user-management-description">
        Quản lý danh sách tài khoản, phân quyền và điều chỉnh trạng thái hoạt động của người dùng trong hệ thống.
      </Text>
      <Divider />
      
      {/* Header với công cụ tìm kiếm và nút thêm mới */}
      <UserManagementHeader 
        searchText={searchText}
        setSearchText={setSearchText}
        onAddUser={() => setAddModalVisible(true)}
        onRefresh={fetchUsers}
        loading={loading}
      />
      
      {/* Bảng dữ liệu */}
      <UserManagementTable 
        loading={loading}
        users={filteredUsers}
        pagination={pagination}
        onTableChange={handleTableChange}
        onEditUser={showEditModal}
        onResetPassword={showResetPasswordModal}
        onManageCredits={showCreditsModal}
        fetchUsers={fetchUsers}
      />
      
      {/* Modal thêm tài khoản */}
      <AddUserModal 
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        loading={loading}
        setLoading={setLoading}
        fetchUsers={fetchUsers}
      />
      
      {/* Modal chỉnh sửa tài khoản */}
      <EditUserModal 
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        loading={loading}
        setLoading={setLoading}
        fetchUsers={fetchUsers}
        currentUser={currentUser}
      />
      
      {/* Modal đặt lại mật khẩu */}
      <ResetPasswordModal 
        visible={resetPasswordModalVisible}
        onCancel={() => setResetPasswordModalVisible(false)}
        loading={loading}
        setLoading={setLoading}
        currentUser={currentUser}
      />
      
      {/* Modal quản lý credits */}
      <CreditsModal 
        visible={creditsModalVisible}
        onCancel={() => setCreditsModalVisible(false)}
        loading={loading}
        setLoading={setLoading}
        fetchUsers={fetchUsers}
        currentUser={currentUser}
        creditOperation={creditOperation}
      />
    </div>
  );
};

export default UserManagement;