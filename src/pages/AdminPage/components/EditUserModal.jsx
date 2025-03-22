import { useEffect } from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';
import { UserOutlined, MailOutlined, EditOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { updateUserProfile } from '../../../api/apis';

const EditUserModal = ({ visible, onCancel, loading, setLoading, fetchUsers, currentUser }) => {
  const [form] = Form.useForm();
  
  // Set form values when currentUser changes
  useEffect(() => {
    if (currentUser && visible) {
      form.setFieldsValue({
        username: currentUser.username,
        email: currentUser.email
      });
    }
  }, [currentUser, visible, form]);
  
  // Cập nhật thông tin người dùng
  const handleUpdateUser = async (values) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const result = await updateUserProfile(currentUser.id, {
        username: values.username,
        email: values.email
      });
      
      if (result.success) {
        message.success('Cập nhật thông tin thành công!');
        fetchUsers(); // Tải lại danh sách
        onCancel(); // Đóng modal
      } else {
        message.error(result.error || 'Cập nhật thông tin thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      message.error('Đã xảy ra lỗi khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<><EditOutlined /> Chỉnh sửa tài khoản</>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdateUser}
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
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật
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

EditUserModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  currentUser: PropTypes.object
};

export default EditUserModal;