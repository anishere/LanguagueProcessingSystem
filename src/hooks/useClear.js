const useClear = ({ setInputText, setOutputText, setDetectVoice }) => {
    const handleClear = () => {
      if (setInputText) setInputText("");
      if (setOutputText) setOutputText("");
      if (setDetectVoice) setDetectVoice(""); // ✅ Xóa luôn detectVoice nếu có
    };
  
    return { handleClear };
  };
  
  export default useClear;
  