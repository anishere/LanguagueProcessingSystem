// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from "react";
import { speechToText, translateText } from "./api/apis";
import languages from "./settings/languagesCode";
import "./App.css"
import { FiDelete } from "react-icons/fi";
import { PiMicrophoneLight } from "react-icons/pi";
import { FaRegCirclePause } from "react-icons/fa6";

function App() {
  const [inputText, setInputText] = useState(""); // Văn bản đầu vào
  const [outputText, setOutputText] = useState(""); // Kết quả dịch
  const [targetLang, setTargetLang] = useState("vi"); // Ngôn ngữ đích
  const [isRecording, setIsRecording] = useState(false);
  const [detectVoice, setDetectVoice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);
  const outputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Hàm cập nhật chiều cao của textarea và output div
  useEffect(() => {
    if (textareaRef.current && outputRef.current) {
      textareaRef.current.style.height = "auto"; // Reset trước khi tính lại
      const newHeight = Math.max(textareaRef.current.scrollHeight, 150) + "px";
      textareaRef.current.style.height = newHeight;
      outputRef.current.style.height = `calc(${newHeight} + 26px)`;
    }
  }, [inputText]);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      alert("Vui lòng nhập văn bản để dịch!");
      return;
    }

    try {
      console.log(targetLang)
      setIsLoading(true);
      const result = await translateText(inputText, targetLang);
      setOutputText(result);
    } catch (error) {
      console.error("Lỗi khi dịch văn bản:", error);
      alert("Đã xảy ra lỗi khi dịch văn bản!");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setInputText("");
    setOutputText("");
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });

        setIsLoading(true);

        try {
          const result = await speechToText(audioBlob);
          setInputText((prev) => prev + " " + result.transcript);
          setDetectVoice(result.detected_language)
        } catch (error) {
          console.error("Speech-to-text failed:", error);
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="container">
      <h1 className="text-center text-primary mb-4">Translate AI</h1>
      <div className="row">
        {/* Cột nhập văn bản */}
        <div className="col-md-6 position-relative">
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Đang xử lý .... Hãy kiên nhẫn</p>
            </div>
          )}
          {inputText && <i className="icon-delete position-absolute" onClick={handleClear}><FiDelete /></i>}
          <div className="wrap-input form-control inputData"
          >
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
        </div>
        {/* Cột chọn ngôn ngữ và kết quả */}
        <div className="col-md-6 mt-md-0 mt-3">
          <div>
            <select
              className="form-select selectLan mb-md-3 mb-2"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {languages && languages.map((lang) => (
                <option key={lang.name} value={lang.name}>
                  {lang.name}
                </option>
              ))}
            </select>
            {detectVoice && <span className="mx-2">Voice Detected:<b>{detectVoice}</b></span>}
          </div>

          <div
            ref={outputRef}
            className="border p-3 output-text"
            style={{
              minHeight: "100px",
              overflowY: "auto",
            }}
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
          </div>
        </div>
      </div>

      {/* Nút dịch */}
      <div className=" mt-2">
        <button className="btn btn-primary" onClick={handleTranslate}>
          {isLoading ? "Đang dịch..." : "Dịch"}
        </button>
      </div>
    </div>
  );
}

export default App;
