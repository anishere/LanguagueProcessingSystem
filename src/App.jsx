/* eslint-disable no-unused-vars */
import React, { useRef } from "react";
import "./App.css";
import useTranslate from "./hooks/useTranslate"; // ✅ Import custom hook
import useSpeechToText from "./hooks/useSpeechToText"; // ✅ Import custom hook
import InputTextArea from "./components/InputTextArea";
import LanguageSelector from "./components/LanguageSelector";
import OutputText from "./components/OutputText";
import LoadingOverlay from "./components/LoadingOverlay";
import TranslateButton from "./components/TranslateButton";
import useClear from "./hooks/useClear";
import { Bounce, ToastContainer } from "react-toastify";
import useAnalyze from "./hooks/useAnalyze";
import AnalyzeButton from "./components/AnalyzeButton";
import AnalysisResults from "./components/AnalysisResults";

function App() {
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
    <div className="container">
      <h1 className="text-center text-primary mb-4">Translate AI</h1>
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
        <div className="col-md-6">
          <LanguageSelector targetLang={targetLang} setTargetLang={setTargetLang} setTargetLangFull={setTargetLangFull}  />
          <OutputText targetLang={targetLang} outputText={outputText} isLoading={isLoading} outputRef={outputRef} />
        </div>
      </div>
      
      <TranslateButton handleTranslate={handleTranslate} isLoading={isLoading} />    

      <AnalyzeButton handleAnalyze={() => handleAnalyze(inputText)} isAnalyzing={isAnalyzing} />

      {analysisResult.length > 0 && <AnalysisResults analysisResult={analysisResult} totalLength={totalLength} />}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
        />
    </div>
  );
}

export default App;
