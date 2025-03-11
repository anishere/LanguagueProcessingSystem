/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import PropTypes from "prop-types";
import { FiDelete, FiDownload, FiCopy } from "react-icons/fi"; // Thêm FiCopy
import { PiMicrophoneLight } from "react-icons/pi";
import { FaRegCirclePause } from "react-icons/fa6";
import { HiOutlineSpeakerWave, HiOutlineStopCircle } from "react-icons/hi2";
import useAnalyzeAndSpeech from "../hooks/useAnalyzeAndSpeech";
import LoadingOverlay from "./LoadingOverlay";
import { toast, Bounce } from "react-toastify"; // Thêm toast để thông báo copy thành công

// ✅ Sử dụng forwardRef để có thể truy cập methods từ component cha
const InputTextArea = forwardRef(({
  inputText,
  setInputText,
  handleClear,
  isRecording,
  startRecording,
  stopRecording,
  detectVoice,
  outputRef,
}, ref) => {
  const textareaRef = useRef(null);
  const { 
    isAnalyze, 
    analyzeAndSpeak, 
    stopSpeaking, 
    isSpeaking, 
    currentLang,
    downloadableAudio,
    clearDownloadableAudio,
    canShowDownload,
    hasAudio
  } = useAnalyzeAndSpeech(inputText); // ✅ Truyền inputText vào hook để theo dõi thay đổi 

  // ✅ Để component cha có thể truy cập methods
  useImperativeHandle(ref, () => ({
    clearAudio: clearDownloadableAudio,
    hasAudio: () => hasAudio,
    stopSpeech: stopSpeaking
  }));

  useEffect(() => {
    if (textareaRef.current && outputRef?.current) {
      textareaRef.current.style.height = "auto"; 
      const newHeight = Math.max(textareaRef.current.scrollHeight, 150) + "px";
      textareaRef.current.style.height = newHeight;
      outputRef.current.style.height = `calc(${newHeight} + 33px)`;
    }
  }, [inputText, outputRef]);

  // ✅ Hàm xử lý tải xuống file audio
  const handleDownload = () => {
    if (downloadableAudio) {
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadableAudio.url;
      downloadLink.download = downloadableAudio.filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // ✅ Mở rộng hàm handleClear để đồng thời xóa file audio
  const combinedClear = () => {
    clearDownloadableAudio(); // Xóa file audio
    handleClear(); // Gọi hàm xóa text của component cha
  };

  // ✅ Thêm mới: Hàm xử lý sao chép văn bản
  const handleCopy = () => {
    if (inputText) {
      navigator.clipboard.writeText(inputText)
        .then(() => {
          // Hiển thị thông báo sao chép thành công
          toast.success("✅ Đã sao chép văn bản!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
        })
        .catch(error => {
          console.error("❌ Lỗi khi sao chép văn bản:", error);
          toast.error("❌ Không thể sao chép văn bản!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
        });
    }
  };

  return (
  <>
    {(isAnalyze) && <LoadingOverlay />}
    <div className="col-md-6 p-1 position-relative">
      {isAnalyze && <LoadingOverlay />}
      {detectVoice && <span className="mx-2 voiceDetected">Voice Detected: <b>{detectVoice}</b></span>}
      {inputText && <i className="icon-delete position-absolute" onClick={combinedClear}><FiDelete /></i>}
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
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? <FaRegCirclePause /> : <PiMicrophoneLight />}
      </i>
      {/* Biểu tượng phát âm thanh */}
      {inputText &&
        <i
        className={`position-absolute icon-speakerIn ${isSpeaking ? "speaking" : ""}`}
        onClick={isSpeaking ? stopSpeaking : () => analyzeAndSpeak(inputText)}
        title={isSpeaking ? `⏹ Dừng phát` : "Phát âm thanh"}
      >
        {isSpeaking ? <HiOutlineStopCircle /> : <HiOutlineSpeakerWave />}
      </i>
      }
      {/* Chỉ hiển thị nút tải xuống khi có audio và được phép hiển thị */}
      {downloadableAudio && canShowDownload && (
        <i
          className="position-absolute icon-downloadAudio"
          onClick={handleDownload}
          title="Tải xuống file audio"
        >
          <FiDownload />
        </i>
      )}
      {/* Thêm mới: Icon sao chép văn bản - chỉ hiển thị khi có văn bản */}
      {inputText && (
        <i
          className="position-absolute icon-copy"
          onClick={handleCopy}
          title="Sao chép văn bản"
        >
          <FiCopy />
        </i>
      )}
      {/* Hiển thị ngôn ngữ đang phát */}
      {isSpeaking && (
        <span className="playing-text">🔊 Đang phát: {currentLang}</span>
      )}
    </div>
  </>
  );
});

InputTextArea.propTypes = {
  inputText: PropTypes.string.isRequired,
  setInputText: PropTypes.func.isRequired,
  handleClear: PropTypes.func.isRequired,
  isRecording: PropTypes.bool.isRequired,
  startRecording: PropTypes.func.isRequired,
  stopRecording: PropTypes.func.isRequired,
  detectVoice: PropTypes.string,
  outputRef: PropTypes.object,
};

InputTextArea.displayName = 'InputTextArea'; // ✅ Tốt cho DevTools

export default InputTextArea;