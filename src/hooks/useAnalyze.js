import { useState, useRef } from "react";
import { 
  analyzeLanguage, 
  getCurrentUser, 
  subtractUserCredits,
  saveCreditHistory // ✅ Thêm import hàm saveCreditHistory
} from "../api/apis"; 
import { Bounce, toast } from "react-toastify";
import { useDispatch } from "react-redux"; 
import { toggleAction } from "../redux/actionSlice"; 

// ✅ Hàm loại bỏ ký tự đặc biệt & khoảng trắng
const removeSpecialCharacters = (text) => {
  return text.replace(/[.,:;#@$%^&*()_+={}[\]<>?/\\|"'\-—\s]/g, "");
};

const useAnalyze = () => {
  const [analysisResult, setAnalysisResult] = useState([]); // ✅ Lưu kết quả phân tích theo thứ tự API trả về
  const [isAnalyzing, setIsAnalyzing] = useState(false); // ✅ Trạng thái đang phân tích
  const [totalLength, setTotalLength] = useState(0); // ✅ Tổng ký tự hợp lệ
  const [languagePercentages, setLanguagePercentages] = useState({}); // ✅ Lưu phần trăm từng ngôn ngữ
  
  // ✅ Thêm dispatch từ Redux
  const dispatch = useDispatch();
  
  // ✅ Thêm ref để lưu trữ văn bản đã phân tích gần đây nhất
  const lastTextRef = useRef("");
  // ✅ Thêm ref để lưu trữ kết quả phân tích gần đây nhất
  const lastResultRef = useRef(null);
  
  // ✅ Hàm đếm số từ (giống trong useTranslate)
  const countWords = (text) => {
    const trimmedText = text.trim();
    if (trimmedText === '') return 0;
    return trimmedText.split(/\s+/).length;
  };

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
      // ✅ Kiểm tra nếu văn bản đã được phân tích trước đó
      const isTextChanged = text !== lastTextRef.current;
      
      // ✅ Nếu văn bản không thay đổi và đã có kết quả, sử dụng lại kết quả cũ
      if (!isTextChanged && lastResultRef.current) {
        console.log("🔄 Sử dụng kết quả phân tích từ bộ nhớ đệm");
        
        // Sử dụng kết quả đã lưu trữ
        setAnalysisResult(lastResultRef.current.analyzedResult);
        setTotalLength(lastResultRef.current.totalChars);
        setLanguagePercentages(lastResultRef.current.calculatedPercentages);
        
        toast.info("Văn bản không thay đổi, sử dụng kết quả phân tích đã có", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
          transition: Bounce,
        });
        
        return;
      }
      
      // ✅ Chỉ thực hiện logic trừ credits nếu văn bản thay đổi
      if (isTextChanged) {
        // ===== BẮT ĐẦU: THÊM LOGIC KIỂM TRA CREDITS =====
        // Đếm số từ trong văn bản
        const wordCount = countWords(text);
        
        // Lấy thông tin người dùng từ localStorage
        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;
        
        // Kiểm tra và lấy thông tin người dùng
        if (user?.user_id) {
          const userInfoResult = await getCurrentUser(user.user_id);
          
          // Kiểm tra lấy thông tin người dùng thành công
          if (!userInfoResult.success) {
            toast.error("Không thể lấy thông tin người dùng", {
              position: "top-right",
              autoClose: 5000,
              theme: "light",
              transition: Bounce,
            });
            return;
          }
  
          // Lấy số credits từ response
          const userCredits = userInfoResult.data?.credits || 0;
          
          // Kiểm tra đủ credits không
          if (userCredits < wordCount) {
            toast.error(`Không đủ credits. Bạn cần ${wordCount} credits để phân tích văn bản`, {
              position: "top-right",
              autoClose: 5000,
              theme: "light",
              transition: Bounce,
            });
            return;
          }
  
          // Trừ credits
          const creditsResult = await subtractUserCredits(user.user_id, wordCount);
          
          // Kiểm tra trừ credits thành công
          if (!creditsResult.success) {
            toast.error(creditsResult.error || "Không thể trừ credits", {
              position: "top-right",
              autoClose: 5000,
              theme: "light",
              transition: Bounce,
            });
            return;
          }
          
          console.log(`✅ Đã trừ ${wordCount} credits cho phân tích văn bản`);
          
          // ✅ THÊM: Lưu lịch sử giao dịch sau khi trừ credits thành công
          const historyResult = await saveCreditHistory(
            user.user_id,
            wordCount,
            "subtract", 
            "analysis" // Chỉ rõ là dùng cho tính năng phân tích
          );
          
          // Kiểm tra kết quả lưu lịch sử
          if (!historyResult.success) {
            console.warn("⚠️ Lưu lịch sử giao dịch không thành công:", historyResult.error);
            // Không return ở đây để không ảnh hưởng đến quá trình phân tích
          } else {
            console.log("✅ Đã lưu lịch sử giao dịch thành công");
          }
        }
        // ===== KẾT THÚC: THÊM LOGIC KIỂM TRA CREDITS =====
      }

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
      
      // ✅ Lưu văn bản và kết quả phân tích để sử dụng lại sau này
      lastTextRef.current = text;
      lastResultRef.current = {
        analyzedResult,
        totalChars,
        calculatedPercentages
      };
      
      // ✅ Chỉ dispatch nếu văn bản thay đổi (đã trừ credits)
      if (isTextChanged) {
        // ✅ THÊM: Dispatch action để reset credit UI
        dispatch(toggleAction());
      }
    } catch (error) {
      console.error("❌ Lỗi khi phân tích ngôn ngữ:", error);
      toast.error("Đã xảy ra lỗi khi phân tích văn bản!", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ✅ Thêm hàm xóa bộ nhớ đệm
  const clearAnalysisCache = () => {
    lastTextRef.current = "";
    lastResultRef.current = null;
  };

  return { 
    setAnalysisResult, 
    analysisResult, 
    isAnalyzing, 
    handleAnalyze, 
    totalLength, 
    languagePercentages,
    clearAnalysisCache // ✅ Export hàm để xóa bộ nhớ đệm nếu cần
  };
};

export default useAnalyze;