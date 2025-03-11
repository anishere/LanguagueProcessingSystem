import PropTypes from "prop-types";
import { HiOutlineSpeakerWave, HiOutlineStopCircle } from "react-icons/hi2";
import { FiCopy, FiDownload } from "react-icons/fi"; // ✅ Thêm icons
import useTextToSpeech from "../hooks/useTextToSpeech";
import LoadingOverlay from "./LoadingOverlay";
import { useEffect } from "react";
import { toast } from "react-toastify";

const OutputText = ({ outputText, isLoading, outputRef, targetLang }) => {
  const { 
    playTextToSpeech, 
    stopSpeaking, 
    isSpeaking, 
    isCallTTS,
    canDownload,
    downloadAudio,
    resetAudioState
  } = useTextToSpeech();

  // ✅ Theo dõi thay đổi của outputText để reset audio state
  useEffect(() => {
    resetAudioState(outputText);
  }, [outputText, resetAudioState]);

  // ✅ Hàm xử lý sao chép văn bản
  const handleCopyText = () => {
    if (!outputText) return;
    
    navigator.clipboard.writeText(outputText)
      .then(() => {
        toast.success("✅ Đã sao chép văn bản!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      })
      .catch((error) => {
        console.error("❌ Lỗi khi sao chép văn bản:", error);
        toast.error("❌ Không thể sao chép văn bản!", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  // ✅ Hàm xử lý tải xuống audio
  const handleDownloadAudio = () => {
    if (!canDownload) return;
    
    // Tạo tên file từ 20 ký tự đầu tiên của văn bản
    const fileName = outputText
      .substring(0, 20)
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_");
      
    downloadAudio(fileName || "audio");
  };

  return (
    <>
      {isCallTTS && <LoadingOverlay />}
      <div
        ref={outputRef}
        className="border output-text position-relative"
        style={{ minHeight: "100px", overflowY: "auto" }}
      >
        {isLoading ? (
          <div className="text-center">
            <div className="text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <p className={outputText ? "" : "placeholder"}>{outputText || "Bản dịch..."}</p>
        )}
        
        {/* Icons container - chỉ hiển thị khi có outputText */}
        {outputText && (
          <div className="position-absolute bottom-0 end-0 p-2 d-flex gap-2">
            {/* ✅ Icon download audio - chỉ hiển thị khi đã phát xong âm thanh */}
            {canDownload && (
              <i
                className="icon-action"
                onClick={handleDownloadAudio}
                title="📥 Tải xuống âm thanh"
                style={{ cursor: "pointer", fontSize: "1.2rem" }}
              >
                <FiDownload />
              </i>
            )}
            
            {/* ✅ Icon copy text */}
            <i
              className="icon-action"
              onClick={handleCopyText}
              title="📋 Sao chép văn bản"
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
            >
              <FiCopy />
            </i>
          </div>
        )}
        
        {/* Speaker icon */}
        {outputText && (
          <i
            className={`position-absolute icon-speakerOut ${isSpeaking ? "speaking" : ""}`}
            onClick={isSpeaking ? stopSpeaking : () => playTextToSpeech(outputText, targetLang)}
            title={isSpeaking ? "⏹ Dừng phát" : "🔊 Phát âm thanh"}
          >
            {isSpeaking ? <HiOutlineStopCircle /> : <HiOutlineSpeakerWave />}
          </i>
        )}
      </div>
    </>
  );
};

OutputText.propTypes = {
  outputText: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  outputRef: PropTypes.object,
  targetLang: PropTypes.string.isRequired,
};

export default OutputText;