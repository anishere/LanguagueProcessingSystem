import { Table, Button, Space, Tooltip, Select, Switch, Popconfirm, message } from 'antd';
import { 
  EditOutlined, DeleteOutlined, ExclamationCircleOutlined, 
  KeyOutlined, PlusCircleOutlined, MinusCircleOutlined 
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import { changeAccountType, updateActiveStatus, deleteUser } from '../../../api/apis';

const { Option } = Select;

const UserManagementTable = ({ 
  loading, 
  users, 
  pagination, 
  onTableChange, 
  onEditUser, 
  onResetPassword, 
  onManageCredits,
  fetchUsers
}) => {
  // Format date/time
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Thay đổi loại tài khoản (admin/user)
  const handleAccountTypeChange = async (userId, isAdmin) => {
    try {
      const result = await changeAccountType(userId, isAdmin);
      
      if (result.success) {
        message.success(result.message);
        fetchUsers(); // Tải lại danh sách
      } else {
        message.error(result.error || 'Thay đổi loại tài khoản thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi loại tài khoản:', error);
      message.error('Đã xảy ra lỗi khi thay đổi loại tài khoản');
    }
  };
  
  // Cập nhật trạng thái hoạt động
  const handleStatusChange = async (userId, isActive) => {
    try {
      // Thêm log để debug
      console.log(`Đang cập nhật trạng thái cho user ID: ${userId}, trạng thái mới: ${isActive}`);
      
      // Hiển thị trạng thái loading cho toàn bộ bảng
      const loadingMessage = message.loading({
        content: `Đang ${isActive ? "kích hoạt" : "vô hiệu hóa"} tài khoản...`,
        key: `status-${userId}`,
        duration: 0,
      });
      
      const result = await updateActiveStatus(userId, isActive);
      
      // Đóng message loading
      loadingMessage();
      
      if (result.success) {
        message.success({
          content: result.message,
          key: `status-${userId}`,
        });
        fetchUsers(); // Tải lại danh sách để cập nhật UI
      } else {
        message.error({
          content: result.error || 'Cập nhật trạng thái thất bại',
          key: `status-${userId}`,
        });
        
        // Khôi phục UI về trạng thái trước khi thay đổi
        // Cách này không lý tưởng nhưng cần reload lại dữ liệu từ server
        fetchUsers();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      message.error('Đã xảy ra lỗi khi cập nhật trạng thái');
      
      // Khôi phục UI về trạng thái trước khi thay đổi
      fetchUsers();
    }
  };
  
  // Xóa tài khoản
  const handleDeleteUser = async (userId) => {
    try {
      const result = await deleteUser(userId);
      
      if (result.success) {
        message.success(result.message);
        fetchUsers(); // Tải lại danh sách
      } else {
        message.error(result.error || 'Xóa tài khoản thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi xóa tài khoản:', error);
      message.error('Đã xảy ra lỗi khi xóa tài khoản');
    }
  };
  
  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username?.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email?.localeCompare(b.email),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => formatDateTime(text),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Đăng nhập gần nhất',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (text) => formatDateTime(text),
      sorter: (a, b) => new Date(a.last_login) - new Date(b.last_login),
    },
    {
      title: 'Loại tài khoản',
      dataIndex: 'account_type',
      key: 'account_type',
      render: (type, record) => (
        <Select
          value={type === "1" ? "admin" : "user"}
          style={{ width: 120 }}
          onChange={(value) => handleAccountTypeChange(record.id, value === "admin")}
          disabled={loading}
        >
          <Option value="admin">Admin</Option>
          <Option value="user">User</Option>
        </Select>
      ),
      filters: [
        { text: 'Admin', value: '1' },
        { text: 'User', value: '0' },
      ],
      onFilter: (value, record) => record.account_type === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (status, record) => {
        // Console.log để debug giá trị thực tế
        console.log(`User ${record.username} - is_active:`, status, typeof status);
        
        // Chuyển đổi status về boolean để đảm bảo hoạt động đúng
        // So sánh lỏng lẻo (== thay vì ===) để xử lý cả string và number
        const isActive = status == 1 || status === true || status === "1" || status === "true";
        
        return (
          <Switch
            checkedChildren="Hoạt động"
            unCheckedChildren="Tạm khóa"
            checked={isActive}
            onChange={(checked) => {
              // Log để debug
              console.log(`Changing user ${record.id} status to:`, checked);
              // Chuyển đổi checked thành 1/0 khi gửi đến API
              handleStatusChange(record.id, checked ? 1 : 0);
            }}
            disabled={loading}
          />
        );
      },
      filters: [
        { text: 'Hoạt động', value: 1 },
        { text: 'Tạm khóa', value: 0 },
      ],
      // Cải thiện logic lọc để xử lý nhiều kiểu dữ liệu
      onFilter: (value, record) => {
        if (value === 1) {
          return record.is_active == 1 || record.is_active === true || record.is_active === "1" || record.is_active === "true";
        } else {
          return record.is_active == 0 || record.is_active === false || record.is_active === "0" || record.is_active === "false" || record.is_active === null;
        }
      },
    },
    {
      title: 'Số dư (Credits)',
      dataIndex: 'credits',
      key: 'credits',
      render: (credits) => <span>{credits?.toLocaleString() || 0}</span>,
      sorter: (a, b) => a.credits - b.credits,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<EditOutlined />} 
              onClick={() => onEditUser(record)}
              disabled={loading}
            />
          </Tooltip>
          <Tooltip title="Đặt lại mật khẩu">
            <Button 
              type="default" 
              shape="circle" 
              icon={<KeyOutlined />} 
              onClick={() => onResetPassword(record)}
              disabled={loading}
            />
          </Tooltip>
          <Tooltip title="Nạp tiền">
            <Button 
              type="default" 
              style={{ color: '#52c41a', borderColor: '#52c41a' }}
              shape="circle" 
              icon={<PlusCircleOutlined />} 
              onClick={() => onManageCredits(record, 'add')}
              disabled={loading}
            />
          </Tooltip>
          <Tooltip title="Trừ tiền">
            <Button 
              type="default"
              style={{ color: '#f5222d', borderColor: '#f5222d' }}
              shape="circle" 
              icon={<MinusCircleOutlined />} 
              onClick={() => onManageCredits(record, 'subtract')}
              disabled={loading}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa tài khoản này?"
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              disabled={loading}
            >
              <Button 
                type="primary" 
                danger 
                shape="circle" 
                icon={<DeleteOutlined />}
                disabled={loading}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      onChange={onTableChange}
      scroll={{ x: 1500 }}
      size="middle"
    />
  );
};

UserManagementTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired,
  pagination: PropTypes.object.isRequired,
  onTableChange: PropTypes.func.isRequired,
  onEditUser: PropTypes.func.isRequired,
  onResetPassword: PropTypes.func.isRequired,
  onManageCredits: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired
};

export default UserManagementTable;