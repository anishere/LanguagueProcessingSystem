// hooks/useTranslate.js
import { useState } from "react";
import { translateText, saveTranslationHistory } from "../api/apis";
import { Bounce, toast } from "react-toastify";

const useTranslate = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [targetLang, setTargetLang] = useState("vi");
  const [isLoading, setIsLoading] = useState(false);
  const [targetLangFull, setTargetLangFull] = useState("vietnamese");
  const [sourceLang, setSourceLang] = useState("auto"); // Thêm source language
  const [sourceLangFull, setSourceLangFull] = useState("auto"); // Thêm source language đầy đủ

  // Lấy thông tin người dùng từ localStorage
  const getUserFromLocalStorage = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
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
    
    try {
      setIsLoading(true);
      const result = await translateText(inputText, targetLangFull);
      setOutputText(result);
      
      // Lưu lịch sử dịch thuật
      const user = getUserFromLocalStorage();
      if (user?.user_id) {
        try {
          // Lưu lịch sử dịch thuật vào server
          await saveTranslationHistory(
            user.user_id,
            inputText,
            result,
            sourceLangFull || "Auto", // Sử dụng "auto" nếu không có source language
            targetLangFull
          );
        } catch (historyError) {
          console.error("Lỗi khi lưu lịch sử dịch:", historyError);
          // Không hiển thị lỗi lưu lịch sử cho người dùng
        }
      }
      
      return result;
    } catch (error) {
      console.error("Lỗi khi dịch văn bản:", error);
      toast.error("Đã xảy ra lỗi khi dịch văn bản!");
      return "";
    } finally {
      setIsLoading(false);
    }
  };

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
    setSourceLangFull
  };
};

export default useTranslate;