/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Button, Card, message, Typography, Upload, Row, Col, Divider } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';


const { Title, Text } = Typography;

const LogoUploader = ({ originalLogo, onImageSelected }) => {
  const [tempFile, setTempFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Hàm xử lý upload từ Ant Design Upload component
  const handleAntUpload = (info) => {
    if (info.file) {
      const file = info.file.originFileObj || info.file;

      // Kiểm tra kích thước và loại file
      if (validateFile(file)) {
        // Lưu file vào state
        setTempFile(file);
        
        // Tạo URL preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        
        // Truyền file lên component cha để xử lý base64 khi lưu
        onImageSelected(file);
        
        message.success('Đã chọn ảnh: ' + file.name);
      }
    }
  };

  // Kiểm tra file hợp lệ
  const validateFile = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      message.error('Kích thước file không được vượt quá 2MB!');
      return false;
    }
    
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      message.error('Chỉ hỗ trợ định dạng JPG, PNG, GIF!');
      return false;
    }
    
    return true;
  };

  // Xóa file đã chọn
  const handleClearFile = () => {
    setTempFile(null);
    setPreviewUrl('');
    onImageSelected(null); // Reset file ở component cha
    message.info('Đã xóa ảnh đã chọn');
  };

  return (
    <Card title="Upload Logo" className="logo-upload-card">
      {/* Hiển thị ảnh gốc nếu có */}
      {originalLogo && (
        <div className="original-logo-section">
          <Title level={5}>Ảnh gốc từ hệ thống</Title>
          <div className="logo-preview-container">
            <img
              src={originalLogo}
              alt="Logo gốc"
              style={{ maxWidth: '100%', maxHeight: '150px' }}
            />
          </div>
        </div>
      )}
      
      <Divider />
      
      {/* Phần upload file mới */}
      <Title level={5}>Tải lên ảnh mới (532px x 150px)</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Upload
            name="logo"
            accept="image/png,image/jpeg,image/gif"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleAntUpload}
            maxCount={1}
          >
            <Button icon={<CloudUploadOutlined />}>
              Chọn logo
            </Button>
          </Upload>
        </Col>
        
        {/* Hiển thị preview ảnh đã chọn */}
        {tempFile && (
          <Col span={24}>
            <Card title="Ảnh đã chọn" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="file-info">
                    <p><strong>Tên file:</strong> {tempFile.name}</p>
                    <p><strong>Loại file:</strong> {tempFile.type}</p>
                    <p><strong>Kích thước:</strong> {Math.round(tempFile.size / 1024)} KB</p> <p> - Upload ảnh để xem trước và lưu base64 vào database khi nhấn lưu ở đây</p>
                  </div>
                </Col>
                <Col span={12}>
                  {previewUrl && (
                    <div className="preview-container">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                      />
                    </div>
                  )}
                </Col>
              </Row>
              
              <Button 
                danger 
                onClick={handleClearFile} 
                style={{ marginTop: 16 }}
              >
                Xóa ảnh đã chọn
              </Button>
            </Card>
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default LogoUploader;