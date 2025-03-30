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
    }
  };

  const playTextToSpeech = async (text, lang = "vi") => {
    if (!text.trim()) {
      console.warn("⚠ Không có văn bản để phát.");
      return;
    }

    // Ngăn chặn việc gọi nhiều lần khi đang phát
    if (isSpeaking || isCallTTS) {
      console.warn("⚠ Đang xử lý âm thanh, vui lòng đợi...");
      toast.info("Đang xử lý âm thanh, vui lòng đợi...", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    try {
      // Kiểm tra nếu văn bản và ngôn ngữ giống lần gọi trước
      if (text === lastTextRef.current && lang === lastLangRef.current && audioURLRef.current) {
        console.log("🔄 Sử dụng lại audio đã lưu trong bộ nhớ đệm");
        setIsSpeaking(true);
        setCurrentLang(lang);
        
        // Đảm bảo canDownload được thiết lập đúng
        setCanDownload(!!audioBlobRef.current);

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

      setIsCallTTS(true);
      console.log("🔊 Đang gọi API Text-to-Speech...");

      const audioBase64 = await textToSpeech(text, lang);
      
      // Chuyển đổi Base64 thành Blob
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], 
        { type: "audio/mpeg" }
      );
      
      // Lưu Blob để tải xuống ngay lập tức
      audioBlobRef.current = audioBlob;
      setCanDownload(true); // Cho phép tải xuống ngay khi có audio
      
      // Log để xác nhận có audio
      console.log("✅ Đã nhận dữ liệu âm thanh và sẵn sàng cho tải xuống");

      setIsCallTTS(false);
      setIsSpeaking(true);
      setCurrentLang(lang);
      
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
        
        // Phát âm thanh hoàn thành nhỏ để thông báo
        try {
          const completeSound = new Audio("data:audio/wav;base64,UklGRnQGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU8GAACA/4b/cf9e/1T/Zf+M/7P/1//3/w8AIQAfABQAAwDx/+L/2v/X/93/6v/2/wEACwAWACEAKAArACoAJAAaAA4ABgABAAAA//0A9QDtAOYA4QDfAOQA7QD5AAgAGQAoADYAPgBDAEEAPAA0ACsAIwAbABMADAACAPsA9ADtAOkA5QDlAOgA7QDzAPkA/gADAAYACAAJAAgABwAFAAMAAgAAAPsA+QD3APYA9QD2APoA/gADAAcACgANAA4ADwAOAAwACgAHAAQAAgD//73/pv+Q/33/bf9l/2r/ev+W/7z/4f///x0AMgA+AEEAPgA1ACcAGQAMAP//9v/u/+b/4P/c/9z/3//l/+3/9v8AAAkADwAUABUAFAARAAwABgABAPz/9//z//D/7v/u//D/9P/5////BgAMaBIAFQAXABcAFgATAA8ACwAGAAIA/v/6//f/9f/1//b/+P/7//8AAwAHAAoADQAPABAAEAAQAA8ADQALAAgABQADAAEA///+//3//f/+////AAABAAIAAwAFAAYABwAIAAgACAAIAAgABwAGAAYABQAEAAMAAgABAAEA//////7//v/9//3//v/+////AAAAAAEAAQACAAIAAgADAAMAAwADAAQABAAEAAQABAAEAAQABAADAAMAAwACAAIAAQABAAAAAAAAAP///////v/+//7//v/+//7//v/+//7//v/+//7//v/+////////////////////AAAAAAAAAAAAAAEAAQABAAEAAgACAAIAAgACAAMAAwADAAMAAwADAAMAAwADAAMAAwACAAIAAgACAAIAAQABAAAAAAAAAP////////////////////8AAAAAAAAAAQABAAEAAgACAAMAAwAEAAQABQAFAAYABgAHAAcACAAIAAkACQAKAAoACwALAAsADAAMAAwADAAMAAwADAAMAAsACwALAAoACgAJAAgABwAHAAYABQAEAAMAAgABAAAAAP7//f/8//r/+f/4//f/9v/1//T/8//y//H/8P/v/+//7v/t/+3/7P/s/+z/7P/s/+3/7f/u/+//8P/x//L/8//1//b/+P/6//v//v8AAAIABAAHAAkACwAOABAAEwAVABgAGgAdAB8AIQAjACUAJwApACoALAAtAC4ALwAwADEAMQAyADIAMgAyADIAMQAxADAALwAuAC0ALAArACoAKAAnACUAJAAgrvP/HwAeABwAGgAZABcAFQATABEADwANAAsACQAHAAUAAwABAAEA//7+//z8/Pr9+P32/fT98v3w/e/97f3s/er96P7n/ub+5f7k/uP+4v7i/uH+4f7h/uH+4f7i/uL+4/7k/uX+5v7n/uj+6v7r/u3+7/7x/vP+9f74/vr+/f7/8QADAAYACQALALr/yP/V/+P/cQB9AIcAkACYAKAApwCtALIAtgC6AL0AwADCAMMAyQDRANgA3gDjAOcA6gDsAO0A7QDsAOsA6ADoAN0A1wDRAMoAw//F/77AAP//vwC6ALQArQCnAJ4AlgCOAIQAewByAGgAXgBUAEoAPwA1ACkAHgATAAcA+//uAOD/0//F/7j/qv+c/47/gP9y/2X/V/9K/zv/Lv8g/xP/BP/3/ur+3P7P/sL+tf6p/p3+kf6F/nv+cf5n/l3+U/5K/kL+Ov4y/iv+JP4e/hj+E/4O/gn+Bf4B/v797v3r/en95v3m/eT95P3j/eT95f3m/ej96/3u/fL99/38/QL+Cf4Q/hj+IP4p/jL+PP5G/lH+XP5o/nT+gf6O/pz+qv65/sj+2P7o/vn+Cv8c/y7/QP9T/2b/ef+N/6H/tf/J/97/8/8IAB0AMgBIAF0AcgCIAJ4AtADKAOAA9gAMAiABNgFMAWIBeAGOAaQBugHPAeQB+QENAiICNgJKAl0CcAKEApYCqAK6AswC3ALtAv8CDQMlAzkDRwNUA2ADawN3A4EDiwOUA5wDpAOsA7IDuAO+A8MDyAPMA9AD1APXA9oD2wPdA90D3QPcA9sD2QPWA9QD0QPNA8gDwwO+A7gDsQOqA6MDmwOSA4kDfwN0A2gDXANPA0IDNQI=");
          completeSound.volume = 0.2; // Âm lượng nhỏ
          completeSound.play();
        } catch {
          console.log("Không thể phát âm thanh hoàn thành");
        }
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