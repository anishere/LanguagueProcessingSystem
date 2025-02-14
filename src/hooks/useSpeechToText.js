import { useState, useRef } from "react";
import { speechToText } from "../api/apis";

const useSpeechToText = (setInputText) => {
  const [isRecording, setIsRecording] = useState(false);
  const [detectVoice, setDetectVoice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      console.log("🎤 Đang yêu cầu quyền microphone...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Đã cấp quyền microphone!");

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log("🔹 Đã nhận dữ liệu âm thanh:", event.data);
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("⏹ Ghi âm kết thúc!");
        setIsRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });

        console.log("🔹 Gửi audioBlob đến API:", audioBlob);
        setIsLoading(true);

        try {
          const result = await speechToText(audioBlob);
          console.log("✅ Kết quả Speech-to-Text:", result);
          setInputText((prev) => prev + " " + result.transcript);
          setDetectVoice(result.detected_language);
        } catch (error) {
          console.error("❌ Speech-to-text thất bại:", error);
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      console.log("🎙 Ghi âm bắt đầu!");
      setIsRecording(true);
    } catch (error) {
      console.error("❌ Không thể truy cập microphone:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      console.log("⏹ Dừng ghi âm!");
      mediaRecorderRef.current.stop();
    }
  };

  return {
    isRecording,
    detectVoice,
    isLoading,
    startRecording,
    stopRecording,
    setDetectVoice,
  };
};

export default useSpeechToText;
