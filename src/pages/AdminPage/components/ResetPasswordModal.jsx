import { Modal, Form, Input, Button, Space, message } from 'antd';
import { LockOutlined, KeyOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { resetUserPassword } from '../../../api/apis';

const ResetPasswordModal = ({ visible, onCancel, loading, setLoading, currentUser }) => {
  const [form] = Form.useForm();
  
  // Đặt lại mật khẩu
  const handleResetPassword = async (values) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const result = await resetUserPassword(currentUser.id, values.newPassword);
      
      if (result.success) {
        message.success('Đặt lại mật khẩu thành công!');
        onCancel(); // Đóng modal
        form.resetFields(); // Reset form
      } else {
        message.error(result.error || 'Đặt lại mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi đặt lại mật khẩu:', error);
      message.error('Đã xảy ra lỗi khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<><KeyOutlined /> Đặt lại mật khẩu</>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleResetPassword}
        preserve={false}
      >
        {currentUser && (
          <div className="user-info-summary">
            <div><strong>Người dùng:</strong> {currentUser.username}</div>
            <div><strong>Email:</strong> {currentUser.email}</div>
          </div>
        )}
        
        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
        </Form.Item>
        
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Đặt lại mật khẩu
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

ResetPasswordModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
  currentUser: PropTypes.object
};

export default ResetPasswordModal;