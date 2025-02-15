import { useState, useRef } from "react";
import { textToSpeech } from "../api/apis"; // ✅ Import API Text-to-Speech

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false); // ✅ Trạng thái phát âm thanh
  const audioRef = useRef(null); // ✅ Lưu đối tượng `Audio`

  const playTextToSpeech = async (text, lang = "vi") => {
    if (!text.trim()) {
      console.warn("⚠ Không có văn bản để phát.");
      return;
    }

    try {
      setIsSpeaking(true);
      console.log("🔊 Đang gọi API Text-to-Speech...");

      const audioBase64 = await textToSpeech(text, lang);

      // Chuyển đổi Base64 thành Blob
      const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: "audio/mpeg" });

      // ✅ Tạo URL và phát âm thanh
      const audioURL = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioURL);

      audioRef.current = audio; // ✅ Lưu lại đối tượng `Audio`

      audio.play();
      audio.onended = () => {
        setIsSpeaking(false); // ✅ Cập nhật trạng thái khi phát xong
        audioRef.current = null;
      };

    } catch (error) {
      console.error("❌ Lỗi khi gọi Text-to-Speech:", error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause(); // ✅ Dừng phát âm thanh ngay lập tức
      audioRef.current.currentTime = 0; // ✅ Reset về đầu
      audioRef.current = null; // ✅ Xóa đối tượng audio
      setIsSpeaking(false); // ✅ Cập nhật trạng thái
      console.log("⏹ Đã dừng phát âm thanh.");
    }
  };

  return { playTextToSpeech, stopSpeaking, isSpeaking };
};

export default useTextToSpeech;
