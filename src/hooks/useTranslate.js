/* eslint-disable no-unused-vars */
import { useState } from "react";
import { translateText } from "../api/apis";
import useSpeechToText from "./useSpeechToText";
import { Bounce, toast } from "react-toastify";

const useTranslate = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [targetLang, setTargetLang] = useState("vi");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedVoice, setDetectedVoice] = useState();
  const [targetLangFull, setTargetLangFull] = useState("vietnamese")

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
      return;
    }
    try {
      setIsLoading(true);
      const result = await translateText(inputText, targetLangFull);
      setOutputText(result);
    } catch (error) {
      alert("Đã xảy ra lỗi khi dịch văn bản!");
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
    targetLangFull
  };
};

export default useTranslate;
