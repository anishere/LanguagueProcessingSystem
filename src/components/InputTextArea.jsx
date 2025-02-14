/* eslint-disable no-unused-vars */
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FiDelete } from "react-icons/fi";
import { PiMicrophoneLight } from "react-icons/pi";
import { FaRegCirclePause } from "react-icons/fa6";
import { HiOutlineSpeakerWave, HiOutlineStopCircle } from "react-icons/hi2";
import useAnalyzeAndSpeech from "../hooks/useAnalyzeAndSpeech";
import LoadingOverlay from "./LoadingOverlay";

const InputTextArea = ({
  inputText,
  setInputText,
  handleClear,
  isRecording,
  startRecording, // ✅ Đã nhận đúng từ App.jsx
  stopRecording,  // ✅ Đã nhận đúng từ App.jsx
  detectVoice,
  outputRef,
}) => {
  const textareaRef = useRef(null);
  const { isAnalyze, analyzeAndSpeak, stopSpeaking, isSpeaking, currentLang } = useAnalyzeAndSpeech(); 

  useEffect(() => {
    if (textareaRef.current && outputRef?.current) {
      textareaRef.current.style.height = "auto"; 
      const newHeight = Math.max(textareaRef.current.scrollHeight, 150) + "px";
      textareaRef.current.style.height = newHeight;
      outputRef.current.style.height = `calc(${newHeight} + 26px)`;
    }
  }, [inputText, outputRef]);

  return (
    <div className="col-md-6 position-relative">
      {isAnalyze && <LoadingOverlay />}
      {detectVoice && <span className="mx-2 voiceDetected">Voice Detected: <b>{detectVoice}</b></span>}
      {inputText && <i className="icon-delete position-absolute" onClick={handleClear}><FiDelete /></i>}
      <div className="wrap-input form-control inputData">
        <textarea
          ref={textareaRef}
          className="input-text"
          placeholder="Nhập văn bản của bạn..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ overflowY: "hidden", resize: "none" }}
        ></textarea>
      </div>
      <i
        className={`position-absolute icon-microphone ${isRecording ? "recording" : ""}`}
        onClick={isRecording ? stopRecording : startRecording} // ✅ Sửa lỗi gọi hàm
      >
        {isRecording ? <FaRegCirclePause /> : <PiMicrophoneLight />}
      </i>
      {/* ✅ Biểu tượng loa với hiệu ứng dừng */}
      {inputText &&
        <i
        className={`position-absolute icon-speakerIn ${isSpeaking ? "speaking" : ""}`}
        onClick={isSpeaking ? stopSpeaking : () => analyzeAndSpeak(inputText)}
        title={isSpeaking ? `⏹ Dừng phát` : "Phát âm thanh"}
      >
        {isSpeaking ? <HiOutlineStopCircle /> : <HiOutlineSpeakerWave />}
      </i>
      }
      {/* ✅ Hiển thị ngôn ngữ đang phát */}
      {isSpeaking && (
        <span className="playing-text">🔊 Đang phát: {currentLang}</span>
      )}
    </div>
  );
};

InputTextArea.propTypes = {
  inputText: PropTypes.string.isRequired,
  setInputText: PropTypes.func.isRequired,
  handleClear: PropTypes.func.isRequired,
  isRecording: PropTypes.bool.isRequired,
  startRecording: PropTypes.func.isRequired, // ✅ Định nghĩa startRecording
  stopRecording: PropTypes.func.isRequired, // ✅ Định nghĩa stopRecording
  detectVoice: PropTypes.string,
  outputRef: PropTypes.object,
};

export default InputTextArea;
