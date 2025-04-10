/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Card, message, Typography, Divider, Row, Col, Spin, 
  Tabs, Space, Tooltip, InputNumber
} from 'antd';
import { 
  SettingOutlined, SaveOutlined, ReloadOutlined, 
  LinkOutlined, PhoneOutlined, 
  UserOutlined, EnvironmentOutlined, 
  InfoCircleOutlined, GlobalOutlined,
  MailOutlined, HomeOutlined
} from '@ant-design/icons';
import { getConfig, updateConfig } from '../../api/apis';
import LogoUploader from './LogoUploader';
import './Settings.css';

const { Title, Text } = Typography;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [originalLogo, setOriginalLogo] = useState('');
  const [newLogoFile, setNewLogoFile] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a debugging effect to log form values when they change
  useEffect(() => {
    const formValues = form.getFieldsValue();
    console.log("Current form values:", formValues);
  }, [form]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      console.log("Fetching config data...");
      const result = await getConfig();
      console.log("Config API response:", result);
      
      if (result.success && result.data) {
        const configData = result.data;
        console.log("Setting form values with:", configData);
        
        setConfig(configData);
        form.setFieldsValue(configData);
        
        if (configData.logo_link) {
          setOriginalLogo(configData.logo_link);
        }
      } else {
        message.error(result.error || 'Không thể tải thông tin cấu hình');
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin cấu hình:', error);
      message.error('Đã xảy ra lỗi khi tải thông tin cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelected = (file) => {
    setNewLogoFile(file);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      // Chỉ kiểm tra các trường thuộc tab hiện tại
      const fieldsToValidate = activeTab === 'basic' 
        ? ['name_web', 'address_web', 'price'] 
        : ['name_owner', 'phone_1'];
      
      // Kiểm tra tính hợp lệ của các trường trong tab hiện tại
      await form.validateFields(fieldsToValidate);
      
      // Lấy tất cả giá trị hiện tại của form
      const allValues = form.getFieldsValue();
      
      // Chuẩn bị dữ liệu để gửi - Kết hợp giữa giá trị hiện tại của tab đang mở
      // và giá trị đã lưu trước đó từ config cho tab khác
      let dataToSubmit = {};
      
      if (activeTab === 'basic') {
        // Nếu đang ở tab basic, chỉ cập nhật các trường thuộc tab basic
        // và giữ nguyên các trường từ tab contact từ dữ liệu cũ
        dataToSubmit = {
          ...config, // Giữ lại tất cả giá trị cũ
          name_web: allValues.name_web,
          address_web: allValues.address_web,
          price: allValues.price,
          api_key: allValues.api_key
        };
      } else {
        // Nếu đang ở tab contact, chỉ cập nhật các trường thuộc tab contact
        // và giữ nguyên các trường từ tab basic từ dữ liệu cũ
        dataToSubmit = {
          ...config, // Giữ lại tất cả giá trị cũ
          name_owner: allValues.name_owner,
          phone_1: allValues.phone_1,
          phone_2: allValues.phone_2,
          email: allValues.email,
          address: allValues.address,
          google_map_link: allValues.google_map_link
        };
      }
      
      // Loại bỏ những trường không cần thiết
      delete dataToSubmit.id; // ID sẽ được xác định phía server
      
      // Xử lý logo nếu có thay đổi
      if (newLogoFile) {
        const base64Image = await convertToBase64(newLogoFile);
        dataToSubmit.logo_link = base64Image;
      } else if (originalLogo) {
        dataToSubmit.logo_link = originalLogo;
      }

      console.log("Sending data to update config:", dataToSubmit);

      // Gọi API cập nhật
      const result = await updateConfig(dataToSubmit);
      console.log("Update config API response:", result);

      if (result.success) {
        message.success(result.message || 'Cập nhật cấu hình thành công');
        
        // Tải lại cấu hình sau khi cập nhật thành công
        await fetchConfig();
        
        // Reset state cho logo mới nếu có
        setNewLogoFile(null);
      } else {
        message.error(result.error || 'Cập nhật cấu hình thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật cấu hình:', error);
      if (error.errorFields) {
        message.error('Vui lòng điền đầy đủ thông tin trong tab hiện tại');
      } else {
        message.error('Đã xảy ra lỗi khi cập nhật cấu hình');
      }
    } finally {
      setSaving(false);
    }
  };

  const normalizeConversionRate = (value) => {
    return value ? parseInt(value, 10) : 1; // Mặc định là 1 nếu không có giá trị
  };

  const tabItems = [
    {
      key: 'basic',
      label: 'Thông tin cơ bản',
      children: (
        <Row gutter={[24, 0]}>
          <Col xs={24} md={16}>
            <Card title="Thông tin website" className="settings-card">
              <Form.Item
                name="name_web"
                label="Tên website"
                rules={[{ required: true, message: 'Vui lòng nhập tên website' }]}
              >
                <Input prefix={<GlobalOutlined />} placeholder="Nhập tên website" />
              </Form.Item>
              <Form.Item
                name="address_web"
                label="Địa chỉ website"
                rules={[
                  { required: true, message: 'Vui lòng nhập địa chỉ website' },
                  { type: 'url', message: 'Địa chỉ website không hợp lệ' }
                ]}
              >
                <Input prefix={<LinkOutlined />} placeholder="https://example.com" />
              </Form.Item>
              <Form.Item
                name="price" 
                label={
                  <span>
                    Tỉ lệ chuyển đổi
                    <Tooltip title="Tỉ lệ giữa tiền thật và token (ví dụ: 1:1, 1:2, 1:3)">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập tỉ lệ chuyển đổi' },
                  { type: 'number', min: 1, message: 'Tỉ lệ phải lớn hơn hoặc bằng 1' }
                ]}
                normalize={normalizeConversionRate}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập tỉ lệ (ví dụ: 1, 2, 3)"
                  min={1} // Giới hạn giá trị tối thiểu là 1
                />
              </Form.Item>
              <Form.Item name="api_key" label="API Key">
                <Input.Password placeholder="API Key" />
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <LogoUploader 
              originalLogo={originalLogo}
              onImageSelected={handleImageSelected}
            />
          </Col>
        </Row>
      )
    },
    {
      key: 'contact',
      label: 'Thông tin liên hệ',
      children: (
        <Card title="Thông tin liên hệ" className="settings-card">
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name_owner"
                label="Tên chủ sở hữu"
                rules={[{ required: true, message: 'Vui lòng nhập tên chủ sở hữu' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập tên chủ sở hữu" />
              </Form.Item>
              <Form.Item
                name="phone_1"
                label="Số điện thoại 1"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
              </Form.Item>
              <Form.Item name="phone_2" label="Số điện thoại 2">
                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại phụ (nếu có)" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email liên hệ"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="contact@example.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="address"
                label="Địa chỉ công ty"
              >
                <Input prefix={<HomeOutlined />} placeholder="Nhập địa chỉ thực tế của công ty" />
              </Form.Item>
              <Form.Item
                name="google_map_link"
                label="Đường dẫn Google Maps"
                rules={[{ type: 'url', message: 'Đường dẫn Google Maps không hợp lệ' }]}
              >
                <Input prefix={<EnvironmentOutlined />} placeholder="https://maps.google.com/?q=..." />
              </Form.Item>
              <div className="map-preview">
                {form.getFieldValue('google_map_link') ? (
                  <iframe
                    title="Google Map Location"
                    src={form.getFieldValue('google_map_link')}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div className="map-placeholder">
                    <EnvironmentOutlined />
                    <Text>Bản đồ sẽ hiển thị ở đây</Text>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>
      )
    }
  ];

  return (
    <div className="admin-settings">
      <Title level={4}>
        <SettingOutlined /> Cài đặt hệ thống
      </Title>
      <Text type="secondary" className="settings-description">
        Quản lý các thông tin cấu hình và cài đặt chung của hệ thống.
      </Text>
      <Divider />
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text style={{ marginTop: 16 }}>Đang tải thông tin cấu hình...</Text>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={config || {}}
          className="settings-form"
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems}
            className="settings-tabs" 
          />
          <div className="settings-actions">
            <Space>
              <Button 
                type="primary" 
                onClick={handleSaveConfig} 
                loading={saving}
                icon={<SaveOutlined />}
              >
                Lưu cấu hình {newLogoFile ? '(có ảnh mới)' : ''}
              </Button>
              <Button 
                onClick={fetchConfig} 
                icon={<ReloadOutlined />}
                disabled={loading}
              >
                Tải lại
              </Button>
            </Space>
          </div>
        </Form>
      )}
    </div>
  );
};

export default Settings;