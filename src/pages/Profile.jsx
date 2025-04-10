/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Layout, Typography, Card, Avatar, Tag, Button, Form, 
  Input, Spin, Table, Tabs, notification, Descriptions, Divider,
  Row, Col, Space, Skeleton, Result, Badge, ConfigProvider,
  Modal, Alert, Empty
} from 'antd';
import { 
  UserOutlined, EditOutlined, SaveOutlined, 
  CloseCircleOutlined, HistoryOutlined, MailOutlined,
  CalendarOutlined, KeyOutlined, CreditCardOutlined,
  LockOutlined, ExclamationCircleOutlined, DeleteOutlined,
  SettingOutlined, ReloadOutlined, SearchOutlined
} from '@ant-design/icons';
import viVN from 'antd/lib/locale/vi_VN';
import 'antd/dist/reset.css';
import './Profile.css';

// Import các hàm API, thêm getCurrentUser
import { 
  getCreditHistory, 
  updateUserProfile, 
  changePassword, 
  deleteUser, 
  loginUser, 
  getCurrentUser 
} from '../api/apis';

// Import cookie utils
import { getCookie, clearAuthCookies, COOKIE_KEYS } from '../settings/cookies';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
  // State quản lý
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [deleteForm] = Form.useForm();
  const [creditHistory, setCreditHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State phân trang cho lịch sử giao dịch
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Lấy dữ liệu người dùng từ API thay vì từ localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Lấy user_id từ cookie
        const userCookie = getCookie(COOKIE_KEYS.USER);
        
        if (userCookie && userCookie.user_id) {
          const userId = userCookie.user_id;
          // Gọi API để lấy thông tin đầy đủ
          const result = await getCurrentUser(userId);
          if (result.success && result.data) {
            // Lấy dữ liệu người dùng từ response
            const user = result.data;
            setUserData(user);
            
            // Cập nhật form với dữ liệu mới
            form.setFieldsValue({
              username: user.username,
              email: user.email
            });
          } else {
            notification.error({
              message: 'Lỗi',
              description: result.error || 'Không thể tải thông tin người dùng',
            });
          }
        } else {
          notification.error({
            message: 'Lỗi',
            description: 'Không thể tìm thấy ID người dùng, vui lòng đăng nhập lại',
          });
        }
      } catch (error) {
        notification.error({
          message: 'Lỗi',
          description: `Lỗi khi đọc dữ liệu: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [form]);

  // Lấy lịch sử giao dịch
  useEffect(() => {
    fetchCreditHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, historyPagination.current, historyPagination.pageSize]);

  // Hàm lấy lịch sử giao dịch
  const fetchCreditHistory = async () => {
    if (!userData) return;
    
    setHistoryLoading(true);
    try {
      const skip = (historyPagination.current - 1) * historyPagination.pageSize;
      const result = await getCreditHistory(
        userData.user_id,
        skip,
        historyPagination.pageSize,
        'desc'
      );
      
      if (result.success) {
        setCreditHistory(result.items || []);
        setHistoryPagination(prev => ({
          ...prev,
          total: result.total || 0
        }));
      } else {
        notification.error({
          message: 'Lỗi',
          description: result.error || 'Không thể tải lịch sử giao dịch',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: `Lỗi: ${error.message}`,
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  // Xử lý thay đổi phân trang
  const handleHistoryTableChange = (pagination) => {
    setHistoryPagination(pagination);
  };

  // Xử lý khi submit form - sửa đổi để cập nhật từ API
  const handleSubmit = async (values) => {
    if (!userData) return;
    
    setIsSubmitting(true);
    try {
      const result = await updateUserProfile(userData.user_id, values);
      
      if (result.success) {
        // Lấy lại thông tin người dùng từ API thay vì cập nhật localStorage
        const userResult = await getCurrentUser(userData.user_id);
        
        if (userResult.success && userResult.data) {
          const updatedUser = userResult.data;
          setUserData(updatedUser);
          setIsEditing(false);
          notification.success({
            message: 'Thành công',
            description: result.message || 'Cập nhật thông tin thành công!',
          });
        } else {
          notification.warning({
            message: 'Thông báo',
            description: 'Cập nhật thành công nhưng không thể tải lại thông tin mới nhất',
          });
        }
      } else {
        notification.error({
          message: 'Lỗi',
          description: result.error || 'Cập nhật thông tin thất bại',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: `Lỗi: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Xử lý đổi mật khẩu
  const handleChangePassword = async (values) => {
    if (!userData) return;
    
    setIsPasswordChanging(true);
    try {
      const result = await changePassword(
        userData.user_id, 
        values.currentPassword, 
        values.newPassword
      );
      
      if (result.success) {
        notification.success({
          message: 'Thành công',
          description: result.message || 'Đổi mật khẩu thành công!',
        });
        // Reset form sau khi đổi mật khẩu thành công
        passwordForm.resetFields();
      } else {
        notification.error({
          message: 'Lỗi',
          description: result.error || 'Đổi mật khẩu thất bại',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: `Lỗi: ${error.message}`,
      });
    } finally {
      setIsPasswordChanging(false);
    }
  };
  
  // Xử lý xóa tài khoản
  const handleDeleteAccount = async (values) => {
    if (!userData) return;
    
    setIsDeleting(true);
    try {
      // Kiểm tra mật khẩu bằng cách đăng nhập
      const loginResult = await loginUser(userData.email, values.password);
      
      if (loginResult.success) {
        // Nếu đăng nhập thành công, tiến hành xóa tài khoản
        const deleteResult = await deleteUser(userData.user_id);
        
        if (deleteResult.success) {
          notification.success({
            message: 'Thành công',
            description: deleteResult.message || 'Tài khoản đã được xóa thành công!',
          });
          
          // Xóa dữ liệu trong cookies và chuyển hướng về trang đăng nhập
          clearAuthCookies();
          
          // Reload trang để áp dụng thay đổi
          window.location.href = '/login';
        } else {
          notification.error({
            message: 'Lỗi',
            description: deleteResult.error || 'Xóa tài khoản thất bại',
          });
        }
      } else {
        notification.error({
          message: 'Lỗi',
          description: 'Mật khẩu không đúng, vui lòng thử lại',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: `Lỗi: ${error.message}`,
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  // Định dạng ngày
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  // Lấy nhãn loại tài khoản
  const getAccountTypeLabel = (type) => {
    switch (type) {
      case '0': return 'Standard'
      case '1': return 'Admin';
      case '2': return 'Premium';
      case '3': return 'Enterprise';
      default: return 'Basic';
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Layout className="profile-layout profile-page">
        <Content className="profile-container">
          <Skeleton active paragraph={{ rows: 1 }} />
          <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
            <Col xs={24} md={8}>
              <Card className="profile-card">
                <Skeleton active avatar paragraph={{ rows: 6 }} />
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card className="content-card" style={{ marginBottom: '24px' }}>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
              <Card className="content-card">
                <Skeleton active paragraph={{ rows: 6 }} />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }

  // Hiển thị lỗi nếu không có dữ liệu người dùng
  if (!userData) {
    return (
      <Layout className="profile-layout">
        <Content className="profile-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Result
            status="error"
            title="Không Tìm Thấy Dữ Liệu"
            subTitle="Không thể tải thông tin người dùng. Vui lòng đăng nhập lại."
            extra={<Button type="primary" onClick={() => window.location.href = '/login'}>Đăng Nhập</Button>}
          />
        </Content>
      </Layout>
    );
  }

  return (
    <ConfigProvider locale={viVN}>
      <Layout className="profile-layout profile-page">
        <Content className="profile-container fade-in">
          <Title level={2} className="page-title">Hồ Sơ Người Dùng</Title>
          
          <Row gutter={[24, 24]}>
            {/* Card thông tin profile */}
            <Col xs={24} md={8}>
              <Card className="profile-card">
                <div className="profile-header">
                  <Avatar 
                    size={92} 
                    icon={<UserOutlined />}
                    className="profile-avatar"
                  >
                    {userData.username.charAt(0).toUpperCase()}
                  </Avatar>
                </div>
                
                <div className="profile-user-info">
                  <h2 className="profile-username">{userData.username}</h2>
                  <p className="profile-email">{userData.email}</p>
                  <div className="profile-tags">
                    <Tag color="blue">{getAccountTypeLabel(userData.account_type)}</Tag>
                    <Tag color={userData.is_active ? 'green' : 'red'}>
                      {userData.is_active ? 'Hoạt Động' : 'Không Hoạt Động'}
                    </Tag>
                  </div>
                </div>
                
                <Descriptions column={1} layout="horizontal" bordered>
                  <Descriptions.Item label={<><CreditCardOutlined /> Credits</>}>
                    <div className="credit-display">
                      <CreditCardOutlined className="credit-icon" />
                      <span className="credit-amount">{userData.credits.toLocaleString()}</span>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label={<><CalendarOutlined /> Đăng Nhập Gần Đây</>}>
                    {formatDate(userData.last_login)}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><CalendarOutlined /> Ngày Tạo</>}>
                    {formatDate(userData.created_at)}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><KeyOutlined /> ID Người Dùng</>}>
                    {userData.user_id}
                  </Descriptions.Item>
                </Descriptions>
                
                <Button 
                  type="primary" 
                  icon={isEditing ? <CloseCircleOutlined /> : <EditOutlined />}
                  onClick={() => setIsEditing(!isEditing)}
                  style={{ marginTop: '16px' }}
                  block
                >
                  {isEditing ? 'Hủy Chỉnh Sửa' : 'Chỉnh Sửa Hồ Sơ'}
                </Button>
              </Card>
            </Col>
            
            {/* Khu vực nội dung chính */}
            <Col xs={24} md={16}>
              <Tabs defaultActiveKey="1" className="profile-tabs">
                <TabPane 
                  tab={<span><UserOutlined /> Thông Tin Hồ Sơ</span>} 
                  key="1"
                >
                  <Card className="content-card">
                    <div className="card-header">
                      <h3 className="card-title">
                        {isEditing ? 'Chỉnh Sửa Thông Tin Hồ Sơ' : 'Thông Tin Hồ Sơ'}
                      </h3>
                    </div>
                    <Divider className="section-divider" />
                    
                    {isEditing ? (
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        className="edit-form"
                      >
                        <Form.Item
                          name="username"
                          label="Tên Người Dùng"
                          rules={[
                            { required: true, message: 'Vui lòng nhập tên người dùng!' },
                          ]}
                        >
                          <Input 
                            prefix={<UserOutlined />} 
                            placeholder="Nhập tên người dùng" 
                          />
                        </Form.Item>
                        
                        <Form.Item
                          name="email"
                          label="Địa Chỉ Email"
                          rules={[
                            { required: true, message: 'Vui lòng nhập địa chỉ email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                          ]}
                        >
                          <Input 
                            prefix={<MailOutlined />} 
                            placeholder="Nhập địa chỉ email" 
                          />
                        </Form.Item>
                        
                        <Form.Item>
                          <div className="edit-form-buttons">
                            <Button
                              type="primary"
                              htmlType="submit"
                              icon={<SaveOutlined />}
                              loading={isSubmitting}
                            >
                              Lưu Thay Đổi
                            </Button>
                            <Button 
                              onClick={() => setIsEditing(false)}
                              icon={<CloseCircleOutlined />}
                            >
                              Hủy
                            </Button>
                          </div>
                        </Form.Item>
                      </Form>
                    ) : (
                      <Descriptions 
                        bordered 
                        column={{ xs: 1, sm: 1 }}
                        labelStyle={{ fontWeight: 'bold' }}
                        className="profile-descriptions"
                      >
                        <Descriptions.Item label="ID Người Dùng">
                          {userData.user_id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên Người Dùng">
                          {userData.username}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa Chỉ Email">
                          {userData.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cập Nhật Lần Cuối">
                          {formatDate(userData.updated_at)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại Tài Khoản">
                          <Tag color="blue">{getAccountTypeLabel(userData.account_type)}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng Thái">
                          <span className="status-badge">
                            <span className={`status-dot ${userData.is_active ? 'active-dot' : 'inactive-dot'}`}></span>
                            {userData.is_active ? 'Hoạt Động' : 'Không Hoạt Động'}
                          </span>
                        </Descriptions.Item>
                      </Descriptions>
                    )}
                  </Card>
                </TabPane>
                
                {/* Tab lịch sử giao dịch cập nhật */}
                <TabPane 
                  tab={<span><HistoryOutlined /> Lịch Sử Giao Dịch</span>} 
                  key="2"
                >
                  <Card className="content-card">
                    <div className="card-header">
                      <div className='w-100' style={{whiteSpace: "nowrap",display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className="card-title">
                          <HistoryOutlined /> Lịch Sử
                        </h3>
                        <div>
                          <Space>
                            <Button
                              icon={<ReloadOutlined />}
                              onClick={() => fetchCreditHistory()}
                              loading={historyLoading}
                              type="primary"
                              ghost
                              className='text-black p-1'
                            >
                              Làm mới
                            </Button>
                            <Text>
                              <CreditCardOutlined /> Credits hiện tại: <span className="current-balance">{userData.credits.toLocaleString()}</span>
                            </Text>
                          </Space>
                        </div>
                      </div>
                    </div>
                    <Divider className="section-divider" />
                    
                    {historyLoading ? (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: '16px' }}>Đang tải dữ liệu...</div>
                      </div>
                    ) : creditHistory && creditHistory.length > 0 ? (
                      <Table 
                        dataSource={creditHistory}
                        columns={[
                          {
                            title: 'ID',
                            dataIndex: 'id',
                            key: 'id',
                            width: 80,
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
                            render: (type) => {
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
                            },
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
                                case 'translate':
                                  color = 'geekblue';
                                  text = 'Translate';
                                  break;
                                case 'analysis':
                                  color = 'orange';
                                  text = 'Analyze';
                                  break;
                                case 'text-to-speech':
                                  color = 'volcano';
                                  text = 'Text to Speech';
                                  break;
                                case 'speech-to-text':
                                  color = 'lime';
                                  text = 'Speech to Text';
                                  break;
                              }
                              
                              return <Tag color={color}>{text}</Tag>;
                            },
                          },
                          {
                            title: 'Thời gian',
                            dataIndex: 'created_at',
                            key: 'created_at',
                            render: (text) => formatDate(text),
                            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
                            defaultSortOrder: 'descend',
                          },
                        ]}
                        rowKey="id"
                        pagination={{ 
                          ...historyPagination,
                          showSizeChanger: true,
                          showTotal: (total) => `Tổng cộng ${total} giao dịch`,
                          pageSizeOptions: ['5', '10', '20', '50']
                        }}
                        onChange={handleHistoryTableChange}
                        className="transaction-table"
                        scroll={{ x: 800 }}
                      />
                    ) : (
                      <Result
                        icon={<HistoryOutlined style={{ color: '#1890ff' }} />}
                        title="Chưa Có Giao Dịch Nào"
                        subTitle="Các giao dịch credit của bạn sẽ xuất hiện tại đây."
                      />
                    )}
                  </Card>
                </TabPane>
                
                <TabPane 
                  tab={<span><SettingOutlined /> Quản Lý Tài Khoản</span>} 
                  key="3"
                >
                  <Card className="content-card">
                    <div className="card-header">
                      <h3 className="card-title">Đổi Mật Khẩu</h3>
                    </div>
                    <Divider className="section-divider" />
                    
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={handleChangePassword}
                      className="edit-form"
                    >
                      <Form.Item
                        name="currentPassword"
                        label="Mật Khẩu Hiện Tại"
                        rules={[
                          { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' },
                        ]}
                      >
                        <Input.Password 
                          prefix={<LockOutlined />} 
                          placeholder="Nhập mật khẩu hiện tại" 
                        />
                      </Form.Item>
                      
                      <Form.Item
                        name="newPassword"
                        label="Mật Khẩu Mới"
                        rules={[
                          { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                        hasFeedback
                      >
                        <Input.Password 
                          prefix={<LockOutlined />} 
                          placeholder="Nhập mật khẩu mới" 
                        />
                      </Form.Item>
                      
                      <Form.Item
                        name="confirmPassword"
                        label="Xác Nhận Mật Khẩu Mới"
                        dependencies={['newPassword']}
                        hasFeedback
                        rules={[
                          { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password 
                          prefix={<LockOutlined />} 
                          placeholder="Xác nhận mật khẩu mới" 
                        />
                      </Form.Item>
                      
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<LockOutlined />}
                          loading={isPasswordChanging}
                        >
                          Đổi Mật Khẩu
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                  
                  <Card className="content-card danger-zone" style={{ marginTop: '24px' }}>
                    <div className="card-header">
                      <h3 className="card-title text-danger">Khu Vực Nguy Hiểm</h3>
                    </div>
                    <Divider className="section-divider" />
                    
                    <Alert
                      message="Cảnh báo"
                      description="Việc xóa tài khoản sẽ không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn."
                      type="warning"
                      showIcon
                      style={{ marginBottom: '16px' }}
                    />
                    
                    <Button
                      danger
                      type="primary"
                      icon={<DeleteOutlined />}
                      onClick={() => setDeleteModalVisible(true)}
                    >
                      Xóa Tài Khoản
                    </Button>
                    
                    <Modal
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', color: '#ff4d4f' }}>
                          <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
                          Xác Nhận Xóa Tài Khoản
                        </div>
                      }
                      visible={deleteModalVisible}
                      onCancel={() => {
                        setDeleteModalVisible(false);
                        deleteForm.resetFields();
                      }}
                      footer={null}
                      destroyOnClose
                    >
                      <p>Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.</p>
                      <p>Để xác nhận, vui lòng nhập mật khẩu của bạn:</p>
                      
                      <Form
                        form={deleteForm}
                        layout="vertical"
                        onFinish={handleDeleteAccount}
                      >
                        <Form.Item
                          name="password"
                          rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu để xác nhận!' },
                          ]}
                        >
                          <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="Nhập mật khẩu của bạn" 
                          />
                        </Form.Item>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <Button 
                            onClick={() => {
                              setDeleteModalVisible(false);
                              deleteForm.resetFields();
                            }}
                          >
                            Hủy
                          </Button>
                          <Button 
                            danger 
                            type="primary" 
                            htmlType="submit"
                            loading={isDeleting}
                          >
                            Xóa Tài Khoản
                          </Button>
                        </div>
                      </Form>
                    </Modal>
                  </Card>
                </TabPane>
              </Tabs>
            </Col>
          </Row>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default ProfilePage;