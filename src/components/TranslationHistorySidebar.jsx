// components/TranslationHistorySidebar.jsx
import { useState, useRef, useEffect } from "react";
import useTranslationHistory from "../hooks/useTranslationHistory";
import "./TranslationHistorySidebar.css";
import { FaHistory, FaTrash, FaArrowLeft, FaArrowRight, FaSync } from "react-icons/fa";
import { TbHistoryToggle } from "react-icons/tb";

// eslint-disable-next-line react/prop-types
const TranslationHistorySidebar = ({ onSelectTranslation }) => {
  const {
    history,
    isLoading,
    handleDeleteHistory,
    handleDeleteAllHistory,
    refreshHistory
  } = useTranslationHistory();
  
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  
  // Xử lý click bên ngoài để đóng sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  
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
    }
  };
  
  // Hiển thị văn bản bị cắt ngắn nếu quá dài
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };
  
  return (
    <div className="translation-history-sidebar-container">
      {/* Nút toggle sidebar */}
      <button 
        className={`sidebar-toggle-btn ${isOpen ? "open" : ""}`}
        onClick={() => {
          setIsOpen(!isOpen)
          refreshHistory();
        }}
        title={isOpen ? "Đóng lịch sử" : "Mở lịch sử dịch thuật"}
      >
        {/* {isOpen ? <FaArrowRight /> : <FaArrowLeft />} */}
        <TbHistoryToggle />
        <span className="ms-2 d-none d-md-inline"></span>
      </button>
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`translation-history-sidebar ${isOpen ? "open" : ""}`}
      >
        <div className="sidebar-header">
          <h5 className="mb-0">
            <FaHistory className="me-2" />
            Lịch sử dịch thuật
          </h5>
          <div className="d-flex">
            <button 
              className="btn btn-sm btn-outline-secondary me-2" 
              onClick={refreshHistory}
              disabled={isLoading}
              title="Làm mới lịch sử"
            >
              <FaSync />
            </button>
            <button 
              className="btn btn-sm btn-danger" 
              onClick={handleDeleteAllHistory}
              disabled={isLoading || history.length === 0}
              title="Xóa tất cả lịch sử"
            >
              <FaTrash />
            </button>
          </div>
        </div>
        
        <div className="sidebar-content">
          {isLoading ? (
            <div className="text-center p-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2">Đang tải lịch sử dịch thuật...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-3">
              <p className="text-muted">Chưa có lịch sử dịch thuật</p>
            </div>
          ) : (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <div 
                    className="history-content"
                    onClick={() => handleSelectTranslation(item)}
                  >
                    <div className="history-text">
                      <div className="input-text">{truncateText(item.input_text)}</div>
                      <div className="output-text">{truncateText(item.output_text)}</div>
                    </div>
                    <div className="history-info">
                      <small className="text-muted">
                        {item.source_language} → {item.target_language}
                      </small>
                      <small className="text-muted">{formatDate(item.created_at)}</small>
                    </div>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline-danger delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHistory(item.id);
                    }}
                    title="Xóa bản ghi này"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationHistorySidebar;