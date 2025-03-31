// hooks/useTranslate.js
import { useState, useEffect, useRef } from "react";
import { 
  translateText, 
  saveTranslationHistory, 
  getCurrentUser,
  subtractUserCredits,
  saveCreditHistory
} from "../api/apis";
import { Bounce, toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { toggleAction } from "../redux/actionSlice";


const useTranslate = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [targetLang, setTargetLang] = useState("vi");
  const [isLoading, setIsLoading] = useState(false);
  const [targetLangFull, setTargetLangFull] = useState("vietnamese");
  const [sourceLang, setSourceLang] = useState("auto");
  const [sourceLangFull, setSourceLangFull] = useState("auto");
  const [translationStyle, setTranslationStyle] = useState("General");
  const [styleHistory, setStyleHistory] = useState({});
  
  // Lưu trữ thông tin dịch gần nhất để tránh dịch lại khi không có thay đổi
  const lastTranslation = useRef({
    inputText: "",
    targetLangFull: "",
    translationStyle: ""
  });

  const dispatch = useDispatch();

  // Hàm đếm số từ
  const countWords = (text) => {
    const trimmedText = text.trim();
    if (trimmedText === '') return 0;
    return trimmedText.split(/\s+/).length;
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error('Không có văn bản để dịch', {
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
      return "";
    }
    
    // Kiểm tra xem có thay đổi gì so với lần dịch trước không
    const isSameTranslation = 
      inputText === lastTranslation.current.inputText &&
      targetLangFull === lastTranslation.current.targetLangFull &&
      translationStyle === lastTranslation.current.translationStyle;
    
    if (isSameTranslation && outputText) {
      toast.info('Không có thay đổi gì để dịch lại', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "light",
        transition: Bounce
      });
      return outputText;
    }
    
    try {
      // Đếm số từ
      const wordCount = countWords(inputText);
      
      // Lấy userId từ localStorage
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
          return "";
        }

        // Lấy số credits từ response
        const userCredits = userInfoResult.data?.credits || 0;
        
        // Kiểm tra đủ credits không
        if (userCredits < wordCount) {
          toast.error(`Không đủ credits. Bạn cần ${wordCount} credits để dịch`, {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            transition: Bounce,
          });
          return "";
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
          return "";
        }
        
        // Lưu lịch sử giao dịch credits sau khi trừ credits thành công
        try {
          const historyResult = await saveCreditHistory(
            user.user_id,
            wordCount,
            "subtract",
            "translate" 
          );
          
          if (!historyResult.success) {
            console.warn("⚠️ Lưu lịch sử giao dịch không thành công:", historyResult.error);
          } else {
            console.log("✅ Đã lưu lịch sử giao dịch credits thành công");
          }
        } catch (creditHistoryError) {
          console.error("Lỗi khi lưu lịch sử giao dịch credits:", creditHistoryError);
        }
      }
      
      // Thực hiện dịch
      setIsLoading(true);
      
      // Log trước khi dịch để đánh giá
      console.log(`Đang dịch với phong cách: ${translationStyle}`);
      console.log(`Văn bản đầu vào: "${inputText}"`);
      
      const result = await translateText(inputText, targetLangFull, translationStyle);
      setOutputText(result);
      
      // Cập nhật thông tin lần dịch gần nhất
      lastTranslation.current = {
        inputText,
        targetLangFull,
        translationStyle
      };
      
      // Log kết quả để đánh giá
      console.log(`Kết quả dịch: "${result}"`);
      
      // Cập nhật style history khi dịch thành công
      setStyleHistory(prev => ({
        ...prev,
        [translationStyle]: {
          input: inputText,
          output: result,
          timestamp: new Date().toISOString()
        }
      }));
      
      // Lưu lịch sử dịch thuật
      if (user?.user_id) {
        try {
          await saveTranslationHistory(
            user.user_id,
            inputText,
            result,
            sourceLangFull || "Auto",
            targetLangFull
          );
        } catch (historyError) {
          console.error("Lỗi khi lưu lịch sử dịch:", historyError);
        }
      }
      
      dispatch(toggleAction());
      return result;
    } catch (error) {
      console.error("Lỗi khi dịch văn bản:", error);
      toast.error("Đã xảy ra lỗi khi dịch văn bản!");
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lấy lịch sử dịch theo phong cách
  const getStyleTranslationHistory = () => {
    return styleHistory;
  };

  // Hàm xóa lịch sử style khi thay đổi văn bản đầu vào
  useEffect(() => {
    // Khi người dùng thay đổi văn bản đầu vào, xóa lịch sử style
    // để tránh so sánh giữa các văn bản khác nhau
    if (Object.keys(styleHistory).length > 0) {
      setStyleHistory({});
    }
  }, [inputText]);

  return {
    inputText,
    setInputText,
    outputText,
    setOutputText,
    targetLang,
    setTargetLang,
    isLoading,
    handleTranslate,
    setTargetLangFull,
    targetLangFull,
    sourceLang,
    setSourceLang,
    sourceLangFull,
    setSourceLangFull,
    translationStyle,
    setTranslationStyle,
    styleHistory,
    getStyleTranslationHistory
  };
};

export default useTranslate;