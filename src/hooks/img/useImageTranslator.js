import { useState, useCallback } from 'react';
import { message } from 'antd';
import { extractText, analyzeLanguage, translateText } from '../../api/apis';

/**
 * Custom hook xử lý toàn bộ logic trích xuất và dịch văn bản từ hình ảnh
 * @returns {Object} Các state và hàm xử lý
 */
const useImageTranslator = () => {
  const [image, setImage] = useState(null);
  const [translatedResults, setTranslatedResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetLang, setTargetLang] = useState("vi");

  /**
   * Xử lý file ảnh để trích xuất và dịch văn bản
   * @param {File} file - File ảnh cần xử lý
   */
  const processFile = useCallback(async (file) => {
    if (!file) return;
    
    // Reset trạng thái
    setImage(null);
    setTranslatedResults([]);
    setIsProcessing(true);

    // Tạo URL xem trước cho ảnh
    const imgURL = URL.createObjectURL(file);
    setImage(imgURL);

    try {
      // Bước 1: Trích xuất văn bản từ ảnh
      const extracted_text = await extractText(file);
      if (!extracted_text) {
        message.warning("Không tìm thấy văn bản trong ảnh.");
        setIsProcessing(false);
        return;
      }

      // Xử lý trong background để không chặn UI
      const processInBackground = async () => {
        // Bước 2: Phân tích ngôn ngữ
        const analyzedDatasrc = await analyzeLanguage(extracted_text);
        
        // Lọc dữ liệu
        const analyzedData = analyzedDatasrc.filter(item => 
          item.name !== "Unknow" &&
          item.code !== "und" &&
          item.text.trim() !== ""
        );
        
        if (analyzedData.length === 0) {
          return [];
        }
        
        // Bước 3: Dịch văn bản - xử lý theo lô (batch)
        const BATCH_SIZE = 5; // Điều chỉnh kích thước lô tùy theo giới hạn API
        const batches = [];
        
        for (let i = 0; i < analyzedData.length; i += BATCH_SIZE) {
          batches.push(analyzedData.slice(i, i + BATCH_SIZE));
        }
        
        let allTranslatedTexts = [];
        
        // Xử lý lô theo lô, nhưng song song bên trong mỗi lô
        for (const batch of batches) {
          const batchPromises = batch.map(item => 
            translateText(item.text, targetLang)
          );
          const batchResults = await Promise.all(batchPromises);
          allTranslatedTexts = [...allTranslatedTexts, ...batchResults];
        }
        
        // Tạo data cho bảng kết quả
        return analyzedData.map((item, index) => ({
          key: index,
          language: item.code,
          original: item.text,
          translated: allTranslatedTexts[index] || '',
        }));
      };

      // Thực hiện xử lý và cập nhật UI
      const results = await processInBackground();
      setTranslatedResults(results);

    } catch (error) {
      console.error("Lỗi xử lý ảnh hoặc dịch:", error);
      message.error("Đã xảy ra lỗi khi xử lý ảnh hoặc dịch văn bản.");
    } finally {
      setIsProcessing(false);
    }
  }, [targetLang]);

  /**
   * Xóa ảnh và kết quả dịch
   */
  const resetData = useCallback(() => {
    setImage(null);
    setTranslatedResults([]);
  }, []);

  return {
    image,
    translatedResults,
    isProcessing,
    targetLang,
    setTargetLang,
    processFile,
    resetData
  };
};

export default useImageTranslator;