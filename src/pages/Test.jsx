// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useCallback } from "react";
import { Select, Table, Spin, Button, message } from "antd";
import { PlusOutlined, CopyOutlined, DeleteOutlined } from "@ant-design/icons";
import languages from "../settings/languagesCode";
import { extractText, analyzeLanguage, translateText } from "../api/apis";

const { Option } = Select;

const Test = () => {
  const [image, setImage] = useState(null);
  const [translatedResults, setTranslatedResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetLang, setTargetLang] = useState("vi");
  const hiddenFileInput = useRef(null);

  // Sử dụng useCallback để tối ưu hóa hàm
  const handleDivClick = useCallback(() => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  }, []);

  // Hàm xử lý file được tối ưu với xử lý đa luồng
  const processFile = useCallback(async (file) => {
    if (!file) return;
    setImage(null);
    setTranslatedResults([]);
    setIsProcessing(true);

    // Tạo URL xem trước cho ảnh
    const imgURL = URL.createObjectURL(file);
    setImage(imgURL);

    try {
      // Bước 1: Trích xuất văn bản từ ảnh (không thể tối ưu hóa hơn)
      const extracted_text = await extractText(file);
      if (!extracted_text) {
        message.warning("Không tìm thấy văn bản trong ảnh.");
        setIsProcessing(false);
        return;
      }

      // Tạo một worker mới để xử lý công việc nặng trong background
      const processInBackground = async () => {
        // Bước 2 & 3: Thực hiện song song nếu có thể
        // Chúng ta phân tích ngôn ngữ và chuẩn bị dịch song song
        const analyzePromise = analyzeLanguage(extracted_text);
        
        // Chờ kết quả phân tích ngôn ngữ
        const analyzedDatasrc = await analyzePromise;
        
        // Lọc dữ liệu
        const analyzedData = analyzedDatasrc.filter(item => 
          item.name !== "Unknow" &&
          item.code !== "und" &&
          item.text.trim() !== ""
        );
        
        // Xử lý song song các lô dịch để tránh quá tải API
        // Chia thành các lô nhỏ (batch) để tránh quá tải API
        const BATCH_SIZE = 5; // Điều chỉnh kích thước lô dựa trên giới hạn API
        const batches = [];
        
        for (let i = 0; i < analyzedData.length; i += BATCH_SIZE) {
          batches.push(analyzedData.slice(i, i + BATCH_SIZE));
        }
        
        let allTranslatedTexts = [];
        
        // Xử lý tuần tự các lô, nhưng song song bên trong mỗi lô
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
          translated: allTranslatedTexts[index],
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

  // Sử dụng useCallback để tối ưu hóa hàm
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];
    await processFile(file);
  }, [processFile]);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    await processFile(file);
  }, [processFile]);

  // Hàm copy văn bản với thông báo
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success("Đã sao chép vào clipboard!");
    });
  }, []);

  // Hàm copy toàn bộ văn bản từ một cột
  const copyAllFromColumn = useCallback((columnKey) => {
    if (translatedResults.length === 0) return;
    
    const allText = translatedResults
      .map(item => item[columnKey])
      .join("\n\n");
      
    copyToClipboard(allText);
  }, [translatedResults, copyToClipboard]);

  const handleDelete = useCallback(() => {
    setImage(null);
    setTranslatedResults([]);
  }, []);

  // Định nghĩa các cột cho Table kết quả với icons copy toàn bộ
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
            onClick={() => copyAllFromColumn("original")}
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
            onClick={() => copyToClipboard(text)}
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
            onClick={() => copyAllFromColumn("translated")}
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
            onClick={() => copyToClipboard(text)}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Select Option nằm bên phải */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end" }}>
        <Select
          value={targetLang}
          onChange={(value) => setTargetLang(value)}
          style={{ width: "250px", borderRadius: "4px" }}
        >
          {languages.map((lang) => (
            <Option value={lang.code} key={lang.code}>
              {lang.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Khu vực upload: Hiển thị nếu chưa có ảnh */}
      {!image && (
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
      )}

      {/* Nếu đã upload, hiển thị ảnh kèm icon xóa */}
      {image && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
            <Button onClick={handleDelete} icon={<DeleteOutlined />} type="primary" />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <img
              src={image}
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
      )}

      {/* Nếu đang xử lý, hiển thị Spin */}
      {isProcessing && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Spin tip="Đang xử lý..." />
        </div>
      )}

      {/* Bảng kết quả */}
      {translatedResults.length > 0 && (
        <div>
          <h4 style={{ textAlign: "center", marginBottom: "20px" }}>
            📜 Extract & Translate Results 📜
          </h4>
          <Table columns={columns} dataSource={translatedResults} pagination={false} bordered />
        </div>
      )}
    </div>
  );
};

export default Test;