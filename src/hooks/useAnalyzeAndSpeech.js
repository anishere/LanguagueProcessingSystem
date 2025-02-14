import { useState, useRef } from "react";
import { analyzeLanguage, textToSpeech } from "../api/apis"; // ✅ Import API
import { Bounce, toast } from "react-toastify";

const useAnalyzeAndSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);  // ✅ Trạng thái phát âm thanh
  const [isAnalyze, setIsAnalyze] = useState(false);    // ✅ Trạng thái phân tích
  const [currentLang, setCurrentLang] = useState("");   // ✅ Ngôn ngữ đang phát
  const audioRef = useRef(null);                        // ✅ Lưu đối tượng `Audio`
  const stopRequested = useRef(false);                 // ✅ Cờ kiểm tra nếu dừng phát

  const analyzeAndSpeak = async (text) => {
    if (!text.trim()) {
      console.warn("⚠ Không có văn bản để phân tích.");
      return;
    }

    try {
      setIsAnalyze(true);  // ✅ Bắt đầu phân tích
      stopRequested.current = false;  // ✅ Reset trạng thái dừng
      console.log("🔍 Đang phân tích ngôn ngữ...");

      const detectedLanguages = await analyzeLanguage(text);

      if (!detectedLanguages.length) {
        console.warn("⚠ Không nhận diện được ngôn ngữ.");
        toast.error("❌ Không nhận diện được ngôn ngữ!", {
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
        setIsAnalyze(false);
        return;
      }

      console.log("📌 Ngôn ngữ nhận diện:", detectedLanguages);

      setIsAnalyze(false);  // ✅ Kết thúc phân tích
      setIsSpeaking(true);  // ✅ Bắt đầu phát âm thanh

      for (const lang of detectedLanguages) {
        if (stopRequested.current) break; // ✅ Nếu người dùng dừng phát, thoát khỏi vòng lặp

        setCurrentLang(lang.name); // ✅ Hiển thị ngôn ngữ đang phát
        console.log(`🎤 Phát: ${lang.text} (${lang.code})`);

        const audioBase64 = await textToSpeech(lang.text, lang.code);

        // Chuyển đổi Base64 thành Blob
        const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: "audio/mpeg" });

        // ✅ Tạo URL và phát âm thanh
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);
        
        audioRef.current = audio; // ✅ Lưu lại đối tượng `Audio`

        await new Promise((resolve) => {
          audio.onended = () => {
            setCurrentLang(""); // ✅ Xóa trạng thái ngôn ngữ khi kết thúc
            resolve();
          };
          audio.play();
        });

        if (stopRequested.current) break; // ✅ Kiểm tra lại sau khi phát xong một đoạn
      }

    } catch (error) {
      console.error("❌ Lỗi khi phân tích và phát giọng nói:", error);
    } finally {
      setIsSpeaking(false);
      setCurrentLang("");
    }
  };

  const stopSpeaking = () => {
    stopRequested.current = true; // ✅ Đánh dấu yêu cầu dừng phát

    if (audioRef.current) {
      audioRef.current.pause();       // ✅ Dừng phát âm thanh ngay lập tức
      audioRef.current.currentTime = 0; // ✅ Reset về đầu
      audioRef.current = null;       // ✅ Xóa đối tượng audio
      setIsSpeaking(false);          // ✅ Cập nhật trạng thái
      setCurrentLang("");            // ✅ Xóa trạng thái ngôn ngữ
      console.log("⏹ Đã dừng phát âm thanh.");
    }
  };

  return { analyzeAndSpeak, stopSpeaking, isSpeaking, isAnalyze, currentLang };
};

export default useAnalyzeAndSpeech;
