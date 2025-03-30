import PropTypes from "prop-types";
import { HiOutlineSpeakerWave, HiOutlineStopCircle } from "react-icons/hi2";
import { FiCopy } from "react-icons/fi";
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

  return (
    <>
      {(isCallTTS || isSpeaking) && <LoadingOverlay />}
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
        
        <div>
          {/* Icons container - chỉ hiển thị khi có outputText */}
          {outputText && (
            <div className="position-absolute bottom-0 end-0 p-2 d-flex gap-2">
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