import { useCallback } from 'react';
import { message } from 'antd';

/**
 * Custom hook để xử lý các thao tác với clipboard
 * @returns {Object} Các hàm xử lý clipboard
 */
const useClipboard = () => {
  /**
   * Sao chép văn bản vào clipboard và hiển thị thông báo
   * @param {string} text - Văn bản cần sao chép
   * @param {string} successMessage - Thông báo khi sao chép thành công (tùy chọn)
   */
  const copyToClipboard = useCallback((text, successMessage = "Đã sao chép vào clipboard!") => {
    if (!text) {
      message.warning("Không có nội dung để sao chép!");
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        message.success(successMessage);
      })
      .catch((error) => {
        console.error("Lỗi khi sao chép vào clipboard:", error);
        message.error("Không thể sao chép vào clipboard!");
      });
  }, []);

  /**
   * Sao chép toàn bộ nội dung từ một cột trong dữ liệu
   * @param {Array} data - Mảng dữ liệu chứa các hàng
   * @param {string} columnKey - Tên cột cần sao chép
   * @param {string} separator - Chuỗi ngăn cách giữa các mục (mặc định: "\n\n")
   */
  const copyAllFromColumn = useCallback((data, columnKey, separator = "\n\n") => {
    if (!data || data.length === 0) {
      message.warning("Không có dữ liệu để sao chép!");
      return;
    }
    
    const allText = data
      .map(item => item[columnKey])
      .filter(text => text) // Lọc bỏ các giá trị null/undefined/empty
      .join(separator);
      
    copyToClipboard(allText, `Đã sao chép toàn bộ nội dung ${columnKey}!`);
  }, [copyToClipboard]);

  return {
    copyToClipboard,
    copyAllFromColumn
  };
};

export default useClipboard;