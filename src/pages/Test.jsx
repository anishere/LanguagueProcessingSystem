import { useState, useRef, useEffect } from "react";
import { extractText, translateText } from "../api/apis";

const Test = () => {
  const [image, setImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // ✅ Lưu kích thước ảnh thực tế
  const [extractedText, setExtractedText] = useState(""); // ✅ Văn bản gốc
  const [translatedText, setTranslatedText] = useState(""); // ✅ Văn bản dịch
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState("vietnamese");

  const imgRef = useRef(null); // ✅ Lưu tham chiếu đến ảnh

  // ✅ Khi ảnh load, cập nhật kích thước thực tế của ảnh
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
    setTranslatedText("");
    setIsExtracting(true);
    setIsTranslating(false);

    const imgURL = URL.createObjectURL(file);
    setImage(imgURL);

    try {
      // ✅ Trích xuất văn bản từ ảnh
      const extracted_text = await extractText(file);
      if (!extracted_text) {
        console.warn("⚠ Không tìm thấy văn bản trong ảnh.");
        setIsExtracting(false);
        return;
      }

      setExtractedText(extracted_text);
      setIsExtracting(false);

      // ✅ Dịch ngay sau khi trích xuất thành công
      setIsTranslating(true);
      const result = await translateText(extracted_text, targetLang);
      setTranslatedText(result);
      setIsTranslating(false);
    } catch (error) {
      console.error("❌ Lỗi xử lý ảnh hoặc dịch:", error);
      setIsExtracting(false);
      setIsTranslating(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        disabled={isExtracting || isTranslating}
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
            onLoad={() => {
              if (imgRef.current) {
                setImageSize({
                  width: imgRef.current.clientWidth,
                  height: imgRef.current.clientHeight,
                });
              }
            }}
          />

          {/* ✅ Overlay chứa bản dịch - cập nhật kích thước theo ảnh */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${imageSize.width}px`, // ✅ Cập nhật theo ảnh thực tế
              height: `${imageSize.height}px`, // ✅ Cập nhật theo ảnh thực tế
              backgroundColor: "rgba(0, 0, 0, 0.3)", // ✅ Làm mờ ảnh gốc nhẹ
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              whiteSpace: "pre-wrap", // ✅ Giữ nguyên định dạng xuống dòng
              wordWrap: "break-word", // ✅ Đảm bảo nội dung vừa với khung
              fontSize: `${Math.max(12, imageSize.height * 0.05)}px`, // ✅ Tự động điều chỉnh fontSize tối ưu
              padding: `${imageSize.height * 0.05}px`, // ✅ Thêm padding theo tỷ lệ ảnh
              boxSizing: "border-box", // ✅ Đảm bảo padding không làm div to ra
            }}
          >
            {isTranslating
              ? "Đang dịch..."
              : translatedText || "Chưa có kết quả dịch"}
          </div>
        </div>
      )}

      <p>Original: {extractedText}</p>
      <p>Translated: {translatedText}</p>
    </div>
  );
};

export default Test;
