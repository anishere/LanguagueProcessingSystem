import { useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * Component xử lý tải lên hình ảnh với hỗ trợ drag & drop
 */
const ImageUploader = ({ onFileSelect }) => {
  const hiddenFileInput = useRef(null);

  // Khi click vào khu vực upload, gọi input file ẩn
  const handleDivClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  // Xử lý khi file được chọn từ input ẩn
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  // Xử lý khi kéo thả file
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={handleDivClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        border: "3px dashed rgba(0, 0, 0, 0.15)",
        borderRadius: "40px",
        padding: "30px 20px",
        textAlign: "center",
        marginBottom: "20px",
        background: "linear-gradient(135deg, #EFF7FE 0%, #ACBCFF)",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Input file ẩn */}
      <input
        type="file"
        accept="image/*"
        ref={hiddenFileInput}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div style={{ display: "inline-block", borderRadius: "12%" }}>
        <PlusOutlined style={{ fontSize: "24px" }} />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
      <p style={{ margin: 0 }}>
        <strong style={{ color: "#4440C5" }}>Click here</strong> to upload your file or drag and drop.
      </p>
      <p style={{ margin: 0, color: "#888" }}>
        Supported Format: SVG, JPG, PNG, ... (10mb each)
      </p>
    </div>
  );
};

ImageUploader.propTypes = {
  onFileSelect: PropTypes.func.isRequired
};

export default ImageUploader;