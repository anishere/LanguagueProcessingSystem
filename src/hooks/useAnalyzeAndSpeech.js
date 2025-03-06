import { useState, useRef, useEffect } from "react";
import { analyzeLanguage, textToSpeech } from "../api/apis"; // ✅ Import API
import { Bounce, toast } from "react-toastify";

const useAnalyzeAndSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);  // ✅ Trạng thái phát âm thanh
  const [isAnalyze, setIsAnalyze] = useState(false);    // ✅ Trạng thái phân tích
  const [currentLang, setCurrentLang] = useState("");   // ✅ Ngôn ngữ đang phát
  
  const audioRef = useRef(null);                        // ✅ Lưu đối tượng `Audio`
  const stopRequested = useRef(false);                  // ✅ Cờ kiểm tra nếu dừng phát
  
  // ✅ Bộ nhớ đệm đơn giản
  const lastTextRef = useRef("");                       // ✅ Lưu văn bản đã xử lý trước đó  
  const lastResultRef = useRef(null);                   // ✅ Lưu kết quả phân tích ngôn ngữ

  const analyzeAndSpeak = async (text) => {
    if (!text.trim()) {
      console.warn("⚠ Không có văn bản để phân tích.");
      return;
    }

    try {
      stopRequested.current = false;  // ✅ Reset trạng thái dừng
      
      // ✅ Kiểm tra nếu văn bản giống lần gọi trước và đã có kết quả phân tích
      const isSameText = text === lastTextRef.current && lastResultRef.current;
      
      let detectedLanguages;
      
      if (isSameText) {
        // ✅ Sử dụng kết quả phân tích đã lưu
        console.log("🔄 Sử dụng kết quả phân tích ngôn ngữ từ bộ nhớ đệm");
        detectedLanguages = lastResultRef.current;
      } else {
        // ✅ Phân tích ngôn ngữ mới
        setIsAnalyze(true);
        console.log("🔍 Đang phân tích ngôn ngữ...");
        
        detectedLanguages = await analyzeLanguage(text);
        
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
        
        // ✅ Lưu kết quả mới vào bộ nhớ đệm
        lastTextRef.current = text;
        lastResultRef.current = detectedLanguages;
        
        setIsAnalyze(false);
      }
      
      // ✅ Phần phát âm thanh (giống nhau cho cả hai trường hợp)
      setIsSpeaking(true);

      for (const lang of detectedLanguages) {
        if (stopRequested.current) break;

        setCurrentLang(lang.name);
        console.log(`🎤 Phát: ${lang.text} (${lang.code})`);

        const audioBase64 = await textToSpeech(lang.text, lang.code);

        // Chuyển đổi Base64 thành Blob
        const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: "audio/mpeg" });

        // Tạo URL và phát âm thanh
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);
        
        audioRef.current = audio;

        await new Promise((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioURL); // ✅ Giải phóng URL ngay khi không dùng nữa
            setCurrentLang("");
            resolve();
          };
          audio.play();
        });

        if (stopRequested.current) break;
      }

    } catch (error) {
      console.error("❌ Lỗi khi phân tích và phát giọng nói:", error);
      toast.error("❌ Đã xảy ra lỗi trong quá trình xử lý!", {
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
    } finally {
      setIsSpeaking(false);
      setIsAnalyze(false);
      setCurrentLang("");
    }
  };

  const stopSpeaking = () => {
    stopRequested.current = true;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsSpeaking(false);
      setCurrentLang("");
      console.log("⏹ Đã dừng phát âm thanh.");
    }
  };

  // ✅ Cleanup khi component unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      // Không cần giải phóng bộ nhớ đệm vì đơn giản
    };
  }, []);

  return { analyzeAndSpeak, stopSpeaking, isSpeaking, isAnalyze, currentLang };
};

export default useAnalyzeAndSpeech;