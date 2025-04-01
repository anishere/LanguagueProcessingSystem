import { Modal, Form, InputNumber, Button, Space, message, Select } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { 
  addUserCredits, 
  subtractUserCredits, 
  saveCreditHistory 
} from '../../../api/apis';
import { getCookie, COOKIE_KEYS } from '../../../settings/cookies';

const { Option } = Select;

const CreditsModal = ({ 
  visible, 
  onCancel, 
  loading, 
  setLoading, 
  fetchUsers, 
  currentUser, 
  creditOperation 
}) => {
  const [form] = Form.useForm();
  
  // Lấy thông tin người dùng hiện tại từ cookies
  const adminUser = getCookie(COOKIE_KEYS.USER) || {};
  
  // Cập nhật credits của người dùng
  const handleUpdateCredits = async (values) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Xác định loại giao dịch (purchase = nạp, subtract = trừ)
      const transactionType = creditOperation === 'add' ? 'purchase' : 'subtract';
      
      // Thực hiện nạp/trừ tiền
      let result;
      if (creditOperation === 'add') {
        result = await addUserCredits(currentUser.id, values.amount);
      } else {
        result = await subtractUserCredits(currentUser.id, values.amount);
      }
      
      if (result.success) {
        // Lưu lịch sử giao dịch
        const historyResult = await saveCreditHistory(
          currentUser.id, 
          values.amount, 
          transactionType, 
          values.paymentMethod || `admin:${adminUser.username || 'unknown'}`
        );
        
        if (!historyResult.success) {
          console.warn('Lưu lịch sử giao dịch không thành công:', historyResult.error);
        }
        
        message.success(result.message);
        fetchUsers(); // Tải lại danh sách
        onCancel(); // Đóng modal
        form.resetFields(); // Reset form
      } else {
        message.error(result.error || `${creditOperation === 'add' ? 'Cộng' : 'Trừ'} credits thất bại`);
      }
    } catch (error) {
      console.error(`Lỗi khi ${creditOperation === 'add' ? 'cộng' : 'trừ'} credits:`, error);
      message.error(`Đã xảy ra lỗi khi ${creditOperation === 'add' ? 'cộng' : 'trừ'} credits`);
    } finally {
      setLoading(false);
    }
  };
  
  // Set class để styling dựa vào loại thao tác
  const getModalClass = () => {
    return creditOperation === 'add' ? 'modal-add-credits' : 'modal-subtract-credits';
  };

  return (
    <Modal
      title={
        <>{creditOperation === 'add' 
          ? <><PlusCircleOutlined style={{ color: '#52c41a' }} /> Nạp tiền</> 
          : <><MinusCircleOutlined style={{ color: '#f5222d' }} /> Trừ tiền</>}
        </>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
      destroyOnClose={true}
      className={getModalClass()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdateCredits}
        preserve={false}
        initialValues={{
          paymentMethod: 'admin'
        }}
      >
        {currentUser && (
          <div className="user-info-summary credit-summary">
            <div><strong>Người dùng:</strong> {currentUser.username}</div>
            <div><strong>Email:</strong> {currentUser.email}</div>
            <div><strong>Số dư hiện tại:</strong> {currentUser.credits?.toLocaleString() || 0} credits</div>
          </div>
        )}
        
        <Form.Item
          name="amount"
          label="Số credits"
          rules={[
            { required: true, message: 'Vui lòng nhập số credits!' },
            { type: 'number', min: 1, message: 'Số credits phải lớn hơn 0!' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder={`Nhập số credits muốn ${creditOperation === 'add' ? 'nạp' : 'trừ'}`}
            min={1}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
        
        <Form.Item
          name="paymentMethod"
          label="Phương thức thanh toán"
        >
          <Select placeholder="Chọn phương thức thanh toán">
            <Option value="admin">Admin (mặc định)</Option>
            <Option value="bank_transfer">Chuyển khoản ngân hàng</Option>
            <Option value="credit_card">Thẻ tín dụng</Option>
            <Option value="e_wallet">Ví điện tử</Option>
            <Option value="promotional">Khuyến mãi</Option>
          </Select>
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ 
                backgroundColor: creditOperation === 'add' ? '#52c41a' : '#f5222d',
                borderColor: creditOperation === 'add' ? '#52c41a' : '#f5222d'
              }}
            >
              {creditOperation === 'add' ? 'Nạp tiền' : 'Trừ tiền'}
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

CreditsModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  creditOperation: PropTypes.string.isRequired
};

export default CreditsModal;