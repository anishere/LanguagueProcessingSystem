import { useState, useRef, useEffect } from "react";
import { extractText, analyzeLanguage, translateText } from "../api/apis";

const Test = () => {
  const [image, setImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // ✅ Lưu kích thước ảnh thực tế
  const [extractedText, setExtractedText] = useState(""); // ✅ Văn bản gốc
  const [translatedResults, setTranslatedResults] = useState([]); // ✅ Văn bản dịch theo từng đoạn
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetLang, setTargetLang] = useState("vietnamese");

  const imgRef = useRef(null);

  // ✅ Khi ảnh load, cập nhật kích thước thực tế
  useEffect(() => {
    if (imgRef.current) {
      setImageSize({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
    }
  }, [image]);

  // ✅ Xử lý khi người dùng tải ảnh lên
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Reset trạng thái trước khi xử lý ảnh mới
    setImage(null);
    setExtractedText("");
    setTranslatedResults([]);
    setIsProcessing(true);

    const imgURL = URL.createObjectURL(file);
    setImage(imgURL);

    try {
      // ✅ Bước 1: Trích xuất văn bản từ ảnh
      const extracted_text = await extractText(file);
      if (!extracted_text) {
        console.warn("⚠ Không tìm thấy văn bản trong ảnh.");
        setIsProcessing(false);
        return;
      }
      setExtractedText(extracted_text);

      // ✅ Bước 2: Phân tích ngôn ngữ từng phần trong văn bản
      const analyzedData = await analyzeLanguage(extracted_text);

      // ✅ Bước 3: Dịch từng đoạn sang ngôn ngữ đích
      const translatedPromises = analyzedData.map((item) =>
        translateText(item.text, targetLang)
      );

      const translatedTexts = await Promise.all(translatedPromises);
      const translatedResults = analyzedData.map((item, index) => ({
        original: item.text,
        language: item.name,  // Thêm tên ngôn ngữ vào
        translated: translatedTexts[index],
      }));

      setTranslatedResults(translatedResults);
    } catch (error) {
      console.error("❌ Lỗi xử lý ảnh hoặc dịch:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        disabled={isProcessing}
      >
        <option value="vietnamese">Vietnamese</option>
        <option value="english">English</option>
      </select>

      {image && (
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* ✅ Ảnh gốc */}
          <img
            ref={imgRef}
            src={image}
            alt="Uploaded"
            style={{ maxWidth: "500px", width: "100%", height: "auto" }}
          />
        </div>
      )}

      <h4>📜 **Kết quả trích xuất & dịch**</h4>
      {isProcessing ? (
        <p>⏳ Đang xử lý...</p>
      ) : (
        <ul>
          {translatedResults.map((item, index) => (
            <li key={index}>
              <strong>({item.language})</strong> {item.original} : {item.translated}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Test;
