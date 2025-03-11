import { useState, useRef, useEffect } from "react";
import { analyzeLanguage, textToSpeech } from "../api/apis"; // ✅ Import API
import { Bounce, toast } from "react-toastify";

const useAnalyzeAndSpeech = (currentText) => {
  const [isSpeaking, setIsSpeaking] = useState(false);  // ✅ Trạng thái phát âm thanh
  const [isAnalyze, setIsAnalyze] = useState(false);    // ✅ Trạng thái phân tích
  const [currentLang, setCurrentLang] = useState("");   // ✅ Ngôn ngữ đang phát
  const [downloadableAudio, setDownloadableAudio] = useState(null); // ✅ URL audio để tải xuống
  const [canShowDownload, setCanShowDownload] = useState(false); // ✅ Mới: Hiển thị nút tải sau khi phát hết
  
  const audioRef = useRef(null);                        // ✅ Lưu đối tượng `Audio`
  const stopRequested = useRef(false);                  // ✅ Cờ kiểm tra nếu dừng phát
  
  // ✅ Bộ nhớ đệm đơn giản
  const lastTextRef = useRef("");                       // ✅ Lưu văn bản đã xử lý trước đó  
  const lastResultRef = useRef(null);                   // ✅ Lưu kết quả phân tích ngôn ngữ
  const lastAudioRef = useRef(null);                    // ✅ Mới: Lưu dữ liệu audio của lần xử lý trước

  const analyzeAndSpeak = async (text) => {
    if (!text.trim()) {
      console.warn("⚠ Không có văn bản để phân tích.");
      return;
    }

    try {
      stopRequested.current = false;  // ✅ Reset trạng thái dừng
      
      // ✅ Kiểm tra nếu văn bản đã thay đổi so với lần trước
      const isTextChanged = text !== lastTextRef.current;
      
      if (isTextChanged) {
        // ✅ Văn bản thay đổi: Xóa file audio cũ và ẩn nút tải xuống
        clearDownloadableAudio();
        setCanShowDownload(false);
      } else if (lastAudioRef.current && !isTextChanged) {
        // ✅ Văn bản không thay đổi và đã có audio: Phát lại audio cũ
        console.log("🔄 Sử dụng audio đã tạo trước đó");
        setIsSpeaking(true);
        
        // Tạo lại blob từ dữ liệu audio đã lưu
        const audioBlob = new Blob([lastAudioRef.current], { type: "audio/mpeg" });
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);
        
        audioRef.current = audio;
        
        await new Promise((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioURL);
            setCanShowDownload(true); // ✅ Hiển thị nút tải xuống sau khi phát xong
            resolve();
          };
          audio.play().catch(error => {
            console.error("❌ Lỗi khi phát audio:", error);
            resolve();
          });
        });
        
        setIsSpeaking(false);
        return; // ✅ Kết thúc sớm vì đã phát audio
      }
      
      // ✅ Phân tích ngôn ngữ (mới hoặc dùng lại kết quả cũ)
      let detectedLanguages;
      
      if (!isTextChanged && lastResultRef.current) {
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

      // ✅ Tạo mảng để lưu dữ liệu audio của tất cả ngôn ngữ
      const allAudioChunks = [];

      for (const lang of detectedLanguages) {
        if (stopRequested.current) break;

        setCurrentLang(lang.name);
        console.log(`🎤 Phát: ${lang.text} (${lang.code})`);

        const audioBase64 = await textToSpeech(lang.text, lang.code);

        // Chuyển đổi Base64 thành Uint8Array
        const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
        
        // ✅ Lưu dữ liệu audio cho tải xuống
        allAudioChunks.push(audioData);

        // Tạo Blob và URL để phát
        const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);
        
        audioRef.current = audio;

        await new Promise((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioURL); // ✅ Giải phóng URL ngay khi không dùng nữa
            setCurrentLang("");
            resolve();
          };
          audio.play().catch(error => {
            console.error("❌ Lỗi khi phát audio:", error);
            resolve();
          });
        });

        if (stopRequested.current) break;
      }

      // ✅ Tạo file audio kết hợp tất cả ngôn ngữ để tải xuống
      if (allAudioChunks.length > 0 && !stopRequested.current) {
        // Nối các phần dữ liệu audio
        const totalLength = allAudioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combinedAudio = new Uint8Array(totalLength);
        
        let offset = 0;
        for (const chunk of allAudioChunks) {
          combinedAudio.set(chunk, offset);
          offset += chunk.length;
        }
        
        // Lưu dữ liệu audio để sử dụng lại sau này
        lastAudioRef.current = combinedAudio;
        
        // Tạo Blob và URL để tải xuống
        const audioBlob = new Blob([combinedAudio], { type: "audio/mpeg" });
        const downloadURL = URL.createObjectURL(audioBlob);
        
        // Lưu URL để tải xuống
        setDownloadableAudio({
          url: downloadURL,
          filename: `audio_${new Date().toISOString().replace(/[:.]/g, "-")}.mp3`
        });
        
        console.log("💾 Đã tạo file audio để tải xuống");
        
        // ✅ Chỉ cho phép hiển thị nút tải xuống khi phát xong
        setCanShowDownload(true);
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
      
      // ✅ Khi dừng phát âm thanh, vẫn hiển thị nút tải xuống nếu có audio
      if (lastAudioRef.current) {
        setCanShowDownload(true);
      }
    }
  };

  // ✅ Hàm xóa file audio tải xuống
  const clearDownloadableAudio = () => {
    if (downloadableAudio) {
      URL.revokeObjectURL(downloadableAudio.url);
      setDownloadableAudio(null);
    }
    setCanShowDownload(false);
    lastAudioRef.current = null;
  };

  // ✅ Kiểm tra khi input text thay đổi
  useEffect(() => {
    // Nếu text thay đổi so với text đã lưu trong ref, thì xóa audio cũ
    if (currentText && lastTextRef.current && currentText !== lastTextRef.current) {
      console.log("📝 Input text thay đổi, xóa file audio cũ");
      clearDownloadableAudio();
      // Không cập nhật lastTextRef.current ở đây, để cho hàm analyzeAndSpeak xử lý
    }
  }, [currentText]);

  // ✅ Cleanup khi component unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      clearDownloadableAudio(); // ✅ Dọn dẹp URL khi unmount
    };
  }, []);

  return { 
    analyzeAndSpeak, 
    stopSpeaking, 
    isSpeaking, 
    isAnalyze, 
    currentLang, 
    downloadableAudio, // ✅ Thông tin file audio
    clearDownloadableAudio, // ✅ Function để xóa file audio
    canShowDownload, // ✅ State kiểm soát hiển thị nút tải xuống
    hasAudio: !!lastAudioRef.current // ✅ Kiểm tra xem có audio hay không
  };
};

export default useAnalyzeAndSpeech;