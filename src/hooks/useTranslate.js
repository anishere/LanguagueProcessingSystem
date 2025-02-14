/* eslint-disable no-unused-vars */
import { useState } from "react";
import { translateText } from "../api/apis";
import useSpeechToText from "./useSpeechToText";

const useTranslate = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [targetLang, setTargetLang] = useState("vietnamese");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedVoice, setDetectedVoice] = useState();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      alert("Vui lòng nhập văn bản để dịch!");
      return;
    }
    try {
      setIsLoading(true);
      const result = await translateText(inputText, targetLang);
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
  };
};

export default useTranslate;
