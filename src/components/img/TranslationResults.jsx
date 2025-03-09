import { Table, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * Component hiển thị bảng kết quả dịch
 */
const TranslationResults = ({ data, onCopyItem, onCopyAllColumn }) => {
  // Định nghĩa các cột cho Table kết quả
  const columns = [
    {
      title: "Language Code",
      dataIndex: "language",
      key: "language",
      width: "10%",
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Original Text</span>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => onCopyAllColumn("original")}
            size="small"
            title="Copy all original texts"
          />
        </div>
      ),
      dataIndex: "original",
      key: "original",
      width: "40%",
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ flex: 1 }}>{text}</span>
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => onCopyItem(text)}
            title="Copy this text"
          />
        </div>
      ),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Translated Text</span>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => onCopyAllColumn("translated")}
            size="small"
            title="Copy all translated texts"
          />
        </div>
      ),
      dataIndex: "translated",
      key: "translated",
      width: "50%",
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ flex: 1 }}>{text}</span>
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => onCopyItem(text)}
            title="Copy this text"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <h4 style={{ textAlign: "center", marginBottom: "20px" }}>
        📜 Extract & Translate Results 📜
      </h4>
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={false} 
        bordered 
        rowKey="key"
      />
    </div>
  );
};

TranslationResults.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    language: PropTypes.string.isRequired,
    original: PropTypes.string.isRequired,
    translated: PropTypes.string.isRequired
  })).isRequired,
  onCopyItem: PropTypes.func.isRequired,
  onCopyAllColumn: PropTypes.func.isRequired
};

export default TranslationResults;