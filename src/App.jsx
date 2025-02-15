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
  } = useTranslate(); // Sử dụng custom hook

  const {isRecording, detectVoice, startRecording, stopRecording, isLoading: isLoadingRecord, setDetectVoice} = useSpeechToText(setInputText); // ✅ Sử dụng custom hook

  const { handleClear } = useClear({ setInputText, setOutputText, setDetectVoice });

  const outputRef = useRef(null);

  return (
    <div className="container">
      <h1 className="text-center text-primary mb-4">Translate AI</h1>
      {(isLoading || isLoadingRecord) && <LoadingOverlay />}
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
          <LanguageSelector targetLang={targetLang} setTargetLang={setTargetLang} />
          <OutputText targetLang={targetLang} outputText={outputText} isLoading={isLoading} outputRef={outputRef} />
        </div>
      </div>
      <TranslateButton handleTranslate={handleTranslate} isLoading={isLoading} />
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
