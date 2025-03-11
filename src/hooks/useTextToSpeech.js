import { useState, useRef, useEffect } from "react";
import { textToSpeech } from "../api/apis";
import { Bounce, toast } from "react-toastify";

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCallTTS, setIsCallTTS] = useState(false);
  const [currentLang, setCurrentLang] = useState("");
  const [canDownload, setCanDownload] = useState(false); // ✅ Trạng thái cho phép tải xuống
  
  const audioRef = useRef(null);
  const lastTextRef = useRef("");
  const lastLangRef = useRef("");
  const audioURLRef = useRef(null);
  const audioBlobRef = useRef(null); // ✅ Lưu Blob để tải xuống
  
  // ✅ Hàm tải xuống file âm thanh
  const downloadAudio = (fileName = "audio") => {
    if (!audioBlobRef.current) {
      console.warn("⚠ Không có dữ liệu âm thanh để tải xuống.");
      return;
    }
    
    try {
      const url = URL.createObjectURL(audioBlobRef.current);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Giải phóng URL sau khi tải xuống
      
      console.log("📥 Đã tải xuống file âm thanh thành công.");
    } catch (error) {
      console.error("❌ Lỗi khi tải xuống file âm thanh:", error);
      toast.error("❌ Không thể tải xuống file âm thanh!", {
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
    }
  };

  const playTextToSpeech = async (text, lang = "vi") => {
    if (!text.trim()) {
      console.warn("⚠ Không có văn bản để phát.");
      return;
    }

    // Reset trạng thái download khi phát âm thanh mới
    setCanDownload(false);

    try {
      // Kiểm tra nếu văn bản và ngôn ngữ giống lần gọi trước
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
          setCanDownload(true); // ✅ Cho phép tải xuống sau khi phát xong
        };
        return;
      }

      setIsCallTTS(true);
      console.log("🔊 Đang gọi API Text-to-Speech...");

      const audioBase64 = await textToSpeech(text, lang);
      
      setIsCallTTS(false);
      setIsSpeaking(true);
      setCurrentLang(lang);

      // Chuyển đổi Base64 thành Blob
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], 
        { type: "audio/mpeg" }
      );
      
      // Lưu Blob để tải xuống sau này
      audioBlobRef.current = audioBlob;

      // Tạo URL và phát âm thanh
      const audioURL = URL.createObjectURL(audioBlob);
      
      // Lưu trữ thông tin để sử dụng lại sau này
      lastTextRef.current = text;
      lastLangRef.current = lang;
      audioURLRef.current = audioURL;

      const audio = new Audio(audioURL);
      audioRef.current = audio;

      audio.play();
      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentLang("");
        audioRef.current = null;
        setCanDownload(true); // ✅ Cho phép tải xuống sau khi phát xong
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
      setCanDownload(false); // ✅ Reset trạng thái download khi có lỗi
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsSpeaking(false);
      setCurrentLang("");
      console.log("⏹ Đã dừng phát âm thanh.");
    }
  };

  const clearCache = () => {
    if (audioURLRef.current) {
      URL.revokeObjectURL(audioURLRef.current);
      audioURLRef.current = null;
    }
    lastTextRef.current = "";
    lastLangRef.current = "";
    audioBlobRef.current = null; // ✅ Xóa Blob khi clear cache
    setCanDownload(false); // ✅ Reset trạng thái download
  };
  
  // ✅ Hàm reset trạng thái khi outputText thay đổi
  const resetAudioState = (newText) => {
    if (newText !== lastTextRef.current) {
      clearCache();
    }
  };

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
    resetAudioState, // ✅ Export hàm mới
    downloadAudio,   // ✅ Export hàm mới
    isSpeaking, 
    isCallTTS, 
    currentLang,
    canDownload      // ✅ Export trạng thái mới
  };
};

export default useTextToSpeech;