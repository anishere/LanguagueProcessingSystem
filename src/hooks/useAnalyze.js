import { useState } from "react";
import { analyzeLanguage } from "../api/apis"; // ✅ Import API phân tích ngôn ngữ
import { Bounce, toast } from "react-toastify";

// ✅ Hàm loại bỏ ký tự đặc biệt & khoảng trắng
const removeSpecialCharacters = (text) => {
  return text.replace(/[.,:;#@$%^&*()_+={}[\]<>?/\\|"'\-—\s]/g, "");
};

const useAnalyze = () => {
  const [analysisResult, setAnalysisResult] = useState([]); // ✅ Lưu kết quả phân tích theo thứ tự API trả về
  const [isAnalyzing, setIsAnalyzing] = useState(false); // ✅ Trạng thái đang phân tích
  const [totalLength, setTotalLength] = useState(0); // ✅ Tổng ký tự hợp lệ
  const [languagePercentages, setLanguagePercentages] = useState({}); // ✅ Lưu phần trăm từng ngôn ngữ

  const handleAnalyze = async (text) => {
    if (!text.trim()) {
      toast.error('Không có văn bản để phân tích', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log("🔍 Đang phân tích ngôn ngữ...");

      const detectedLanguages = await analyzeLanguage(text);

      if (!detectedLanguages.length) {
        console.warn("⚠ Không nhận diện được ngôn ngữ.");
        setAnalysisResult([]);
        setIsAnalyzing(false);
        return;
      }

      // ✅ Loại bỏ ký tự đặc biệt & tính tổng số ký tự hợp lệ
      const cleanedText = removeSpecialCharacters(text);
      const totalChars = cleanedText.length;
      setTotalLength(totalChars);

      console.log(`📊 Tổng số ký tự hợp lệ: ${totalChars}`);

      // ✅ Xử lý danh sách ngôn ngữ để giữ nguyên thứ tự API trả về
      let languageUsage = {}; // Đếm số ký tự theo ngôn ngữ
      const analyzedResult = detectedLanguages.map((lang) => {
        const langChars = removeSpecialCharacters(lang.text).length;

        // ✅ Cộng dồn ký tự vào tổng số ký tự của từng ngôn ngữ
        if (!languageUsage[lang.name]) {
          languageUsage[lang.name] = 0;
        }
        languageUsage[lang.name] += langChars;

        return { ...lang, charCount: langChars };
      });

      // ✅ Tính phần trăm của từng ngôn ngữ
      const calculatedPercentages = Object.keys(languageUsage).reduce((acc, lang) => {
        acc[lang] = totalChars > 0 ? ((languageUsage[lang] / totalChars) * 100).toFixed(2) : 0;
        return acc;
      }, {});

      setAnalysisResult(analyzedResult);
      setLanguagePercentages(calculatedPercentages);
    } catch (error) {
      console.error("❌ Lỗi khi phân tích ngôn ngữ:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { 
    setAnalysisResult, 
    analysisResult, 
    isAnalyzing, 
    handleAnalyze, 
    totalLength, 
    languagePercentages 
  };
};

export default useAnalyze;
