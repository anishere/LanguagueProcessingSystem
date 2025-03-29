// components/TranslationHistorySidebar.jsx
import { useEffect } from "react";
import useTranslationHistory from "../hooks/useTranslationHistory";
import "./TranslationHistorySidebar.css";
import { Drawer, List, Button, Typography, Spin, Empty } from 'antd';
import { HistoryOutlined, DeleteOutlined, ReloadOutlined, CloseOutlined } from '@ant-design/icons';

// eslint-disable-next-line react/prop-types
const TranslationHistorySidebar = ({ onSelectTranslation, onClose }) => {
  const {
    history,
    isLoading,
    handleDeleteHistory,
    handleDeleteAllHistory,
    refreshHistory
  } = useTranslationHistory();
  
  // Refresh history only once when drawer is opened
  useEffect(() => {
    // Only refresh if history is empty or when explicitly needed
    if (history.length === 0) {
      refreshHistory();
    }
    // Don't include refreshHistory in dependency array to prevent continuous calls
  }, [history.length]);
  
  // Format thời gian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  // Xử lý khi chọn một bản dịch từ lịch sử
  const handleSelectTranslation = (item) => {
    if (onSelectTranslation) {
      onSelectTranslation({
        inputText: item.input_text,
        outputText: item.output_text,
        sourceLanguage: item.source_language,
        targetLanguage: item.target_language
      });
      // Close drawer after selection
      if (onClose) onClose();
    }
  };
  
  // Hiển thị văn bản bị cắt ngắn nếu quá dài
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };
  
  return (
    <Drawer
      title={
        <div className="history-drawer-header">
          <Typography.Title level={5}>
            <HistoryOutlined /> Lịch sử dịch thuật
          </Typography.Title>
          <div className="history-actions">
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshHistory}
              size="small"
              title="Làm mới lịch sử"
              disabled={isLoading}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={handleDeleteAllHistory}
              size="small"
              danger
              title="Xóa tất cả lịch sử"
              disabled={isLoading || history.length === 0}
            />
          </div>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={true}
      width={320}
      closeIcon={<CloseOutlined />}
      className="history-drawer"
    >
      {isLoading ? (
        <div className="loading-container">
          <Spin tip="Đang tải..." />
        </div>
      ) : history.length === 0 ? (
        <Empty description="Chưa có lịch sử dịch thuật" />
      ) : (
        <List
          dataSource={history}
          renderItem={(item) => (
            <List.Item
              className="history-item"
              actions={[
                <Button 
                  key="delete"
                  icon={<DeleteOutlined />} 
                  size="small"
                  danger
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHistory(item.id);
                  }}
                />
              ]}
              onClick={() => handleSelectTranslation(item)}
            >
              <List.Item.Meta
                title={
                  <div className="history-item-title">
                    <span>{truncateText(item.input_text, 30)}</span>
                    <span className="text-muted">
                      {item.source_language} → {item.target_language}
                    </span>
                  </div>
                }
                description={
                  <div className="history-item-content">
                    <div className="history-output">{truncateText(item.output_text, 40)}</div>
                    <small className="history-date">{formatDate(item.created_at)}</small>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
};

export default TranslationHistorySidebar;