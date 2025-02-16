const useClear = ({ setInputText, setOutputText, setDetectVoice, setAnalysisResult }) => {
    const handleClear = () => {
      if (setInputText) setInputText("");
      if (setOutputText) setOutputText("");
      if (setDetectVoice) setDetectVoice(""); // ✅ Xóa luôn detectVoice nếu có
      if (setAnalysisResult) setAnalysisResult([]);
    };
  
    return { handleClear };
  };
  
  export default useClear;
  