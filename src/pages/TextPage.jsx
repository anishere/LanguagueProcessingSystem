// pages/TextPage.jsx
import { useRef } from "react";
import "../App.css";
import useTranslate from "../hooks/useTranslate"; 
import useSpeechToText from "../hooks/useSpeechToText"; 
import InputTextArea from "../components/InputTextArea";
import LanguageSelector from "../components/LanguageSelector";
import OutputText from "../components/OutputText";
import LoadingOverlay from "../components/LoadingOverlay";
import TranslateButton from "../components/TranslateButton";
import useClear from "../hooks/useClear";
import useAnalyze from "../hooks/useAnalyze";
import AnalyzeButton from "../components/AnalyzeButton";
import AnalysisResults from "../components/AnalysisResults";
import useAnalyzeAndSpeech from "../hooks/useAnalyzeAndSpeech";
import TranslationHistorySidebar from "../components/TranslationHistorySidebar";
import languages from "../settings/languagesCode";

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
        setSourceLangFull,
    } = useTranslate();
    
    const {isRecording, detectVoice, startRecording, stopRecording, isLoading: isLoadingRecord, setDetectVoice} = useSpeechToText(setInputText);
    
    const { setAnalysisResult, analysisResult, isAnalyzing, handleAnalyze, totalLength, languagePercentages } = useAnalyze();

    const { clearDownloadableAudio } = useAnalyzeAndSpeech();
    
    const { handleClear } = useClear({ setInputText, setOutputText, setDetectVoice, setAnalysisResult, clearDownloadableAudio });
    
    const outputRef = useRef(null);
    
    // Hàm xử lý khi chọn một lịch sử dịch từ sidebar
    const handleSelectTranslation = (translation) => {
      // Cập nhật văn bản input và output
      setInputText(translation.inputText);
      setOutputText(translation.outputText);
      
      // Cập nhật ngôn ngữ đích
      setTargetLangFull(translation.targetLanguage);
      setSourceLangFull(translation.sourceLanguage);
      
      // Tìm mã ngôn ngữ tương ứng với tên ngôn ngữ đầy đủ
      const targetLanguage = languages.find(
        lang => lang.name.toLowerCase() === translation.targetLanguage.toLowerCase()
      );
      
      if (targetLanguage) {
        setTargetLang(targetLanguage.code);
      }
    };

  return (
    <div className="position-relative">
      {(isLoading || isLoadingRecord || isAnalyzing) && <LoadingOverlay />}
      
      {/* Thêm sidebar */}
      <TranslationHistorySidebar onSelectTranslation={handleSelectTranslation} />
      
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
          <LanguageSelector targetLang={targetLang} setTargetLang={setTargetLang} setTargetLangFull={setTargetLangFull} />
          <OutputText targetLang={targetLang} outputText={outputText} isLoading={isLoading} outputRef={outputRef} />
        </div>
      </div>
      
      <div className="d-flex">
        <TranslateButton handleTranslate={handleTranslate} isLoading={isLoading} />    
        <AnalyzeButton handleAnalyze={() => handleAnalyze(inputText)} isAnalyzing={isAnalyzing} />
      </div>

      {analysisResult.length > 0 && <AnalysisResults analysisResult={analysisResult} totalLength={totalLength} languagePercentages={languagePercentages} />}
    </div>
  );
};

export default TextPage;