import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * Component hiển thị hình ảnh đã tải lên và nút xóa
 */
const ImagePreview = ({ imageUrl, onDelete }) => {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <Button 
          onClick={onDelete} 
          icon={<DeleteOutlined />} 
          type="primary"
          title="Xóa ảnh"
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <img
          src={imageUrl}
          alt="Uploaded"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "40px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
        />
      </div>
    </>
  );
};

ImagePreview.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ImagePreview;