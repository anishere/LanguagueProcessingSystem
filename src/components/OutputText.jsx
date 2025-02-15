import PropTypes from "prop-types";
import { HiOutlineSpeakerWave, HiOutlineStopCircle } from "react-icons/hi2";
import useTextToSpeech from "../hooks/useTextToSpeech"; // ✅ Import Hook mới

const OutputText = ({ outputText, isLoading, outputRef, targetLang }) => {
  const { playTextToSpeech, stopSpeaking, isSpeaking } = useTextToSpeech(); // ✅ Sử dụng Hook

  return (
    <div
      ref={outputRef} // ✅ Gán ref vào div output để cập nhật chiều cao từ InputTextArea
      className="border p-3 output-text position-relative"
      style={{ minHeight: "100px", overflowY: "auto" }}
    >
      {isLoading ? (
        <div className="text-center">
          <div className="text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <p>{outputText || "Kết quả dịch sẽ hiển thị tại đây..."}</p>
      )}
      {/* ✅ Xử lý phát/dừng âm thanh khi nhấn vào icon */}
      {outputText && 
        <i
        className={`position-absolute icon-speakerOut ${isSpeaking ? "speaking" : ""}`}
        onClick={isSpeaking ? stopSpeaking : () => playTextToSpeech(outputText, targetLang)}
        title={isSpeaking ? "⏹ Dừng phát" : "🔊 Phát âm thanh"}
      >
        {isSpeaking ? <HiOutlineStopCircle /> : <HiOutlineSpeakerWave />}
      </i>
      }      
    </div>
  );
};

OutputText.propTypes = {
  outputText: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  outputRef: PropTypes.object, // ✅ Định nghĩa outputRef
  targetLang: PropTypes.string.isRequired, // ✅ Nhận targetLang từ props
};

export default OutputText;
