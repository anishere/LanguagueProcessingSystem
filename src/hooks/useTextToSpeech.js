import { useState } from "react";
import { textToSpeech } from "../api/apis"; // ✅ Import API Text-to-Speech

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playTextToSpeech = async (text, lang = "vi") => {
    if (!text.trim()) {
      console.warn("Không có văn bản để phát.");
      return;
    }

    try {
      setIsSpeaking(true);
      console.log("🔊 Đang gọi API Text-to-Speech...");

      const audioBase64 = await textToSpeech(text, lang);

      // Chuyển đổi Base64 thành Blob
      const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: "audio/mpeg" });

      // Tạo URL và phát âm thanh
      const audioURL = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioURL);

      audio.play();
      audio.onended = () => setIsSpeaking(false); // Khi phát xong, cập nhật trạng thái

    } catch (error) {
      console.error("Lỗi khi gọi Text-to-Speech:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return { playTextToSpeech, isSpeaking };
};

export default useTextToSpeech;
