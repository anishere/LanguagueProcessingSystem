import { Modal, Form, Input, Button, Space, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { registerUser } from '../../../api/apis';

const AddUserModal = ({ visible, onCancel, loading, setLoading, fetchUsers }) => {
  const [form] = Form.useForm();
  
  // Thêm tài khoản mới
  const handleAddUser = async (values) => {
    setLoading(true);
    try {
      const result = await registerUser(
        values.username, 
        values.email, 
        values.password
      );
      
      if (result.success) {
        message.success('Thêm tài khoản thành công!');
        fetchUsers(); // Tải lại danh sách
        onCancel(); // Đóng modal
        form.resetFields(); // Reset form
      } else {
        message.error(result.message || 'Thêm tài khoản thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi thêm tài khoản:', error);
      message.error('Đã xảy ra lỗi khi thêm tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<><PlusOutlined /> Thêm tài khoản mới</>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddUser}
        preserve={false}
      >
        <Form.Item
          name="username"
          label="Tên người dùng"
          rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nhập tên người dùng" />
        </Form.Item>
        
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Nhập email" />
        </Form.Item>
        
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
        </Form.Item>
        
        <Form.Item
          name="confirm"
          label="Xác nhận mật khẩu"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Thêm tài khoản
            </Button>
            <Button onClick={onCancel}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

AddUserModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired
};

export default AddUserModal;