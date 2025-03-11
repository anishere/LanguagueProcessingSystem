const useClear = ({ setInputText, setOutputText, setDetectVoice, setAnalysisResult, clearDownloadableAudio }) => {
    const handleClear = () => {
      if (setInputText) setInputText("");
      if (setOutputText) setOutputText("");
      if (setDetectVoice) setDetectVoice(""); // ✅ Xóa luôn detectVoice nếu có
      if (setAnalysisResult) setAnalysisResult([]);
      if(clearDownloadableAudio) clearDownloadableAudio();
    };
  
    return { handleClear };
  };
  
  export default useClear;
  