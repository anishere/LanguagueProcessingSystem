/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { 
  Button, 
  Select, 
  notification, 
  Spin, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Divider, 
  Radio, 
  InputNumber, 
  Form, 
  Space, 
  Steps 
} from "antd";
import { 
  CreditCardOutlined, 
  DollarOutlined, 
  CheckCircleOutlined, 
  TagOutlined, 
  EditOutlined, 
  ShoppingCartOutlined 
} from '@ant-design/icons';
import { createPayment, checkPaymentStatus, saveCreditHistory, addUserCredits } from "../api/apis";
import './PaymentPage.css';
import { getCookie, COOKIE_KEYS } from '../settings/cookies';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const Payment = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [creditsToAdd, setCreditsToAdd] = useState(0);
  const [orderCode, setOrderCode] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('package');
  const [customAmount, setCustomAmount] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const creditPackages = [
    { value: 5000, credits: 10000, label: "5.000 VNĐ", popular: false },
    { value: 10000, credits: 20000, label: "10.000 VNĐ", popular: false },
    { value: 50000, credits: 100000, label: "50.000 VNĐ", popular: true },
    { value: 100000, credits: 200000, label: "100.000 VNĐ", popular: false },
    { value: 500000, credits: 1000000, label: "500.000 VNĐ", popular: false },
  ];

  useEffect(() => {
    try {
      const user = getCookie(COOKIE_KEYS.USER);
      if (user) {
        setUserData(user);
      } else {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải thông tin người dùng",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: `Lỗi khi đọc dữ liệu: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePackageSelect = (value) => {
    const selectedPackage = creditPackages.find((pkg) => pkg.value === value);
    setAmount(value);
    setCreditsToAdd(selectedPackage ? selectedPackage.credits : value * 2);
    setCurrentStep(1);
  };

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value);
    if (value && value >= 2000) {
      setAmount(value);
      setCreditsToAdd(value * 2);
    } else {
      setAmount(0);
      setCreditsToAdd(0);
    }
  };

  const resetPage = () => {
    window.location.reload();
  };

  const handleCreatePayment = async () => {
    if (!amount || amount < 2000) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng chọn số tiền hợp lệ (tối thiểu 2.000 VNĐ)",
      });
      return;
    }

    setIsLoading(true);
    const description = `Nạp ${creditsToAdd} credits`.substring(0, 25);
    const response = await createPayment(amount, description);
    setIsLoading(false);

    if (response.success && response.data) {
      const { checkout_url, order_code } = response.data;
      if (!checkout_url || !order_code) {
        notification.error({
          message: "Lỗi",
          description: "Dữ liệu trả về không hợp lệ",
        });
        return;
      }
      setOrderCode(order_code);
      setPaymentUrl(checkout_url);
      window.open(checkout_url, "_blank");
      setCheckingPayment(true);
      setCurrentStep(2);
    } else {
      notification.error({
        message: "Lỗi",
        description: response.error || "Không thể tạo thanh toán",
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  useEffect(() => {
    let intervalId;
    if (checkingPayment && orderCode) {
      intervalId = setInterval(async () => {
        const response = await checkPaymentStatus(orderCode);
        if (response.success && response.data) {
          const { success, message } = response.data;
          if (success) {
            clearInterval(intervalId);
            setCheckingPayment(false);
            setCurrentStep(3);

            // Cộng credits cho người dùng
            const addCreditsResponse = await addUserCredits(userData.user_id, creditsToAdd);
            if (addCreditsResponse.success) {
              // Lưu lịch sử giao dịch
              await saveCreditHistory(userData.user_id, creditsToAdd, "purchase", "payos");
              notification.success({
                message: "Thành công",
                description: "Thanh toán hoàn tất, credits đã được cập nhật!",
                duration: 3,
              });
            
              // Chờ sau khi thông báo hiển thị xong rồi mới reset
              setTimeout(() => {
                resetPage();
              }, 3000);
            } else {
              notification.error({
                message: "Lỗi",
                description: "Thanh toán thành công nhưng không thể cộng credits: " + addCreditsResponse.error,
              });
            }
          } else if (message === "Thanh toán bị hủy") {
            clearInterval(intervalId);
            setCheckingPayment(false);
            notification.error({
              message: "Thất bại",
              description: "Thanh toán đã bị hủy",
            });
            resetPage();
          }
        }
      }, 1500);
    }
    return () => clearInterval(intervalId);
  }, [checkingPayment, orderCode, userData, creditsToAdd]);

  if (isLoading) {
    return (
      <div className="payment-loading-container">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="payment-container">
      <Card className="payment-card">
        <Title level={2} className="payment-title">
          <CreditCardOutlined /> Nạp Credits
        </Title>
        
        <Paragraph className="payment-description">
          Chọn hoặc nhập số tiền bạn muốn nạp. Credits sẽ được cộng vào tài khoản ngay sau khi thanh toán thành công.
        </Paragraph>

        <Steps current={currentStep} className="payment-steps">
          <Step title="Chọn gói" description="Chọn số tiền" />
          <Step title="Xác nhận" description="Kiểm tra thông tin" />
          <Step title="Thanh toán" description="Hoàn tất giao dịch" />
        </Steps>

        <Divider />

        <Form form={form} layout="vertical">
          <Form.Item name="paymentType" label="Hình thức nạp tiền">
            <Radio.Group 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="payment-method-selection"
            >
              <Space direction="vertical">
                <Radio value="package">
                  <Text strong>Chọn gói có sẵn</Text>
                </Radio>
                <Radio value="custom">
                  <Text strong>Nhập số tiền tùy chọn</Text> 
                  <Text type="secondary">(Tối thiểu 2.000 VNĐ)</Text>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {paymentMethod === 'package' ? (
            <div className="credit-packages">
              <Row gutter={[16, 16]}>
                {creditPackages.map((pkg) => (
                  <Col xs={24} sm={12} md={8} key={pkg.value}>
                    <Card 
                      hoverable 
                      className={`package-card ${amount === pkg.value ? 'selected-package' : ''} ${pkg.popular ? 'popular-package' : ''}`}
                      onClick={() => handlePackageSelect(pkg.value)}
                    >
                      {pkg.popular && (
                        <div className="popular-tag">
                          <TagOutlined /> Phổ biến
                        </div>
                      )}
                      <Title level={3}>{pkg.label}</Title>
                      <Paragraph>
                        <CreditCardOutlined /> <Text strong>{formatCurrency(pkg.credits)}</Text> Credits
                      </Paragraph>
                      <Text type="secondary">Tỷ lệ: 1 VNĐ = 2 Credits</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ) : (
            <Form.Item
              label="Nhập số tiền (VNĐ)"
              name="customAmount"
              rules={[
                { required: true, message: 'Vui lòng nhập số tiền' },
                { 
                  validator: (_, value) => {
                    if (value && value < 2000) {
                      return Promise.reject('Số tiền tối thiểu là 2.000 VNĐ');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={2000}
                step={1000}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={value => value.replace(/\./g, '')}
                placeholder="Nhập số tiền"
                addonBefore={<DollarOutlined />}
                addonAfter="VNĐ"
                onChange={handleCustomAmountChange}
                className="custom-amount-input"
              />
              {customAmount && customAmount >= 2000 && (
                <div className="credits-preview">
                  <Text>
                    Bạn sẽ nhận được: <Text strong>{formatCurrency(customAmount * 2)}</Text> Credits
                  </Text>
                </div>
              )}
            </Form.Item>
          )}

          {amount > 0 && (
            <Card className="summary-card">
              <Title level={4}>Thông tin đơn hàng</Title>
              <Row gutter={[8, 16]}>
                <Col span={12}>Số tiền:</Col>
                <Col span={12} className="summary-value">{formatCurrency(amount)} VNĐ</Col>
                
                <Col span={12}>Credits nhận được:</Col>
                <Col span={12} className="summary-value">{formatCurrency(creditsToAdd)} Credits</Col>
                
                <Col span={12}>Phương thức thanh toán:</Col>
                <Col span={12} className="summary-value">PayOS</Col>
              </Row>
            </Card>
          )}

          <div className="action-buttons">
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={handleCreatePayment}
              loading={isLoading}
              disabled={!amount || amount < 2000 || checkingPayment}
              size="large"
              className="payment-button"
            >
              Thanh toán qua PayOS
            </Button>
          </div>

          {checkingPayment && (
            <div className="checking-payment">
              <Spin /> 
              <Text>Đang kiểm tra trạng thái thanh toán...</Text>
              <Paragraph type="secondary">
                Vui lòng không đóng cửa sổ thanh toán. Hệ thống sẽ tự động cập nhật khi thanh toán hoàn tất.
              </Paragraph>
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default Payment;