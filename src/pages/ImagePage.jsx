import { Spin } from 'antd';
import ImageUploader from '../components/img/ImageUploader';
import ImagePreview from '../components/img/ImagePreview';
import LanguageSelector from '../components/img/LanguageSelector';
import TranslationResults from '../components/img/TranslationResults';
import useImageTranslator from '../hooks/img/useImageTranslator';
import useClipboard from '../hooks/img/useClipboard';

/**
 * Component chính kết hợp tất cả các thành phần cho ứng dụng dịch từ ảnh
 */
const ImageTranslator = () => {
  // Sử dụng custom hooks
  const { 
    image, 
    translatedResults, 
    isProcessing, 
    targetLang, 
    setTargetLang,
    processFile, 
    resetData 
  } = useImageTranslator();
  
  const { copyToClipboard, copyAllFromColumn } = useClipboard();

  // Hàm xử lý sao chép toàn bộ văn bản từ một cột
  const handleCopyAllColumn = (columnKey) => {
    copyAllFromColumn(translatedResults, columnKey);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Chọn ngôn ngữ đích */}
      <LanguageSelector 
        value={targetLang} 
        onChange={setTargetLang} 
      />

      {/* Khu vực upload: Hiển thị nếu chưa có ảnh */}
      {!image && (
        <ImageUploader onFileSelect={processFile} />
      )}

      {/* Nếu đã upload, hiển thị ảnh kèm icon xóa */}
      {image && (
        <ImagePreview 
          imageUrl={image} 
          onDelete={resetData} 
        />
      )}

      {/* Nếu đang xử lý, hiển thị Spin */}
      {isProcessing && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Spin tip="Đang xử lý..." />
        </div>
      )}

      {/* Bảng kết quả */}
      {translatedResults.length > 0 && (
        <TranslationResults 
          data={translatedResults}
          onCopyItem={copyToClipboard}
          onCopyAllColumn={handleCopyAllColumn}
        />
      )}
    </div>
  );
};

export default ImageTranslator;