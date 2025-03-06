import { useState, useRef, useEffect } from "react";
import { textToSpeech } from "../api/apis"; // ✅ Import API Text-to-Speech
import { Bounce, toast } from "react-toastify";

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false); // ✅ Trạng thái phát âm thanh
  const [isCallTTS, setIsCallTTS] = useState(false);   // ✅ Trạng thái gọi API TTS
  const [currentLang, setCurrentLang] = useState("");  // ✅ Ngôn ngữ đang phát
  
  const audioRef = useRef(null);     // ✅ Lưu đối tượng `Audio`
  const lastTextRef = useRef("");    // ✅ Lưu văn bản đã xử lý trước đó
  const lastLangRef = useRef("");    // ✅ Lưu ngôn ngữ đã xử lý trước đó
  const audioURLRef = useRef(null);  // ✅ Lưu URL audio đã tạo trước đó

  const playTextToSpeech = async (text, lang = "vi") => {
    if (!text.trim()) {
      console.warn("⚠ Không có văn bản để phát.");
      return;
    }

    try {
      // ✅ Kiểm tra nếu văn bản và ngôn ngữ giống lần gọi trước
      if (text === lastTextRef.current && lang === lastLangRef.current && audioURLRef.current) {
        console.log("🔄 Sử dụng lại audio đã lưu trong bộ nhớ đệm");
        setIsSpeaking(true);
        setCurrentLang(lang);

        // Tạo đối tượng Audio mới từ URL đã lưu
        const audio = new Audio(audioURLRef.current);
        audioRef.current = audio;

        audio.play();
        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentLang("");
          audioRef.current = null;
        };
        return;
      }

      setIsCallTTS(true);  // ✅ Bắt đầu gọi API
      console.log("🔊 Đang gọi API Text-to-Speech...");

      const audioBase64 = await textToSpeech(text, lang);
      
      setIsCallTTS(false);  // ✅ Kết thúc gọi API
      setIsSpeaking(true);  // ✅ Bắt đầu phát âm thanh
      setCurrentLang(lang); // ✅ Cập nhật ngôn ngữ đang phát

      // Chuyển đổi Base64 thành Blob
      const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: "audio/mpeg" });

      // ✅ Tạo URL và phát âm thanh
      const audioURL = URL.createObjectURL(audioBlob);
      
      // ✅ Lưu trữ thông tin để sử dụng lại sau này
      lastTextRef.current = text;
      lastLangRef.current = lang;
      audioURLRef.current = audioURL;

      const audio = new Audio(audioURL);
      audioRef.current = audio;

      audio.play();
      audio.onended = () => {
        setIsSpeaking(false);  // ✅ Cập nhật trạng thái khi phát xong
        setCurrentLang("");    // ✅ Xóa trạng thái ngôn ngữ khi kết thúc
        audioRef.current = null;
      };

    } catch (error) {
      console.error("❌ Lỗi khi gọi Text-to-Speech:", error);
      toast.error("❌ Lỗi khi chuyển văn bản thành giọng nói!", {
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
      setIsSpeaking(false);
      setIsCallTTS(false);
      setCurrentLang("");
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause(); // ✅ Dừng phát âm thanh ngay lập tức
      audioRef.current.currentTime = 0; // ✅ Reset về đầu
      audioRef.current = null; // ✅ Xóa đối tượng audio
      setIsSpeaking(false); // ✅ Cập nhật trạng thái
      setCurrentLang(""); // ✅ Xóa trạng thái ngôn ngữ
      console.log("⏹ Đã dừng phát âm thanh.");
    }
  };

  // ✅ Thêm hàm để xóa bộ nhớ đệm khi cần
  const clearCache = () => {
    if (audioURLRef.current) {
      URL.revokeObjectURL(audioURLRef.current); // ✅ Giải phóng tài nguyên
      audioURLRef.current = null;
    }
    lastTextRef.current = "";
    lastLangRef.current = "";
  };

  // ✅ Cleanup khi component unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      clearCache();
    };
  }, []);

  return { 
    playTextToSpeech, 
    stopSpeaking, 
    clearCache,
    isSpeaking, 
    isCallTTS, 
    currentLang 
  };
};

export default useTextToSpeech;