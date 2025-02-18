import { useRef } from "react";
import "../App.css";
import useTranslate from "../hooks/useTranslate"; // ✅ Import custom hook
import useSpeechToText from "../hooks/useSpeechToText"; // ✅ Import custom hook
import InputTextArea from "../components/InputTextArea";
import LanguageSelector from "../components/LanguageSelector";
import OutputText from "../components/OutputText";
import LoadingOverlay from "../components/LoadingOverlay";
import TranslateButton from "../components/TranslateButton";
import useClear from "../hooks/useClear";
import useAnalyze from "../hooks/useAnalyze";
import AnalyzeButton from "../components/AnalyzeButton";
import AnalysisResults from "../components/AnalysisResults";

const TextPage = () => {
    const {
        inputText,
        setInputText,
        outputText,
        setOutputText,
        targetLang,
        setTargetLang,
        isLoading,
        handleTranslate,
        setTargetLangFull,
      } = useTranslate(); // Sử dụng custom hook
    
      const {isRecording, detectVoice, startRecording, stopRecording, isLoading: isLoadingRecord, setDetectVoice} = useSpeechToText(setInputText); // ✅ Sử dụng custom hook
    
      const { setAnalysisResult, analysisResult, isAnalyzing, handleAnalyze, totalLength } = useAnalyze();
    
      const { handleClear } = useClear({ setInputText, setOutputText, setDetectVoice, setAnalysisResult });
    
      const outputRef = useRef(null);

  return (
    <div>
      {(isLoading || isLoadingRecord || isAnalyzing) && <LoadingOverlay />}
      <div className="row">
        <InputTextArea
        inputText={inputText}
        setInputText={setInputText}
        handleClear={handleClear}
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        detectVoice={detectVoice}
        outputRef={outputRef}
        />
        <div className="col-md-6 p-1">
        <LanguageSelector targetLang={targetLang} setTargetLang={setTargetLang} setTargetLangFull={setTargetLangFull}  />
        <OutputText targetLang={targetLang} outputText={outputText} isLoading={isLoading} outputRef={outputRef} />
        </div>
    </div>
    
    <div className="d-flex">
      <TranslateButton handleTranslate={handleTranslate} isLoading={isLoading} />    
      <AnalyzeButton handleAnalyze={() => handleAnalyze(inputText)} isAnalyzing={isAnalyzing} />
    </div>

    {analysisResult.length > 0 && <AnalysisResults analysisResult={analysisResult} totalLength={totalLength} />}
    </div>
  );
};

export default TextPage;
