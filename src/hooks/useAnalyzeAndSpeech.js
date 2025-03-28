import { useState, useRef, useEffect } from "react";
import { 
  analyzeLanguage, 
  textToSpeech, 
  getCurrentUser, 
  subtractUserCredits,
  saveCreditHistory
} from "../api/apis";
import { Bounce, toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { toggleAction } from "../redux/actionSlice";

const useAnalyzeAndSpeech = (currentText) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnalyze, setIsAnalyze] = useState(false);
  const [currentLang, setCurrentLang] = useState("");
  const [downloadableAudio, setDownloadableAudio] = useState(null);
  const [canShowDownload, setCanShowDownload] = useState(false);
  
  const audioRef = useRef(null);
  const stopRequested = useRef(false);
  
  const lastTextRef = useRef("");
  const lastResultRef = useRef(null);
  const lastAudioRef = useRef(null);
  
  // ✅ Thêm bộ nhớ đệm lịch sử cho nhiều văn bản
  const analysisHistoryRef = useRef({});
  
  // ✅ Đối tượng theo dõi trạng thái credits cho mỗi văn bản
  const processedTextsRef = useRef({});
  
  // ✅ Lưu trữ các audio chunks riêng biệt cho từng ngôn ngữ
  const audioChunksRef = useRef({});
  
  // Thêm dispatch từ Redux
  const dispatch = useDispatch();

  // Hàm đếm số từ - sao chép từ useTranslate
  const countWords = (text) => {
    const trimmedText = text.trim();
    if (trimmedText === '') return 0;
    return trimmedText.split(/\s+/).length;
  };
  
  // ✅ Hàm kiểm tra xem đã trừ credits cho văn bản chưa
  const hasDeductedCredits = (text) => {
    return processedTextsRef.current[text] === true;
  };
  
  // ✅ Hàm đánh dấu đã trừ credits
  const markAsDeducted = (text) => {
    processedTextsRef.current[text] = true;
  };

  const analyzeAndSpeak = async (text) => {
    if (!text.trim()) {
      console.warn("⚠ Không có văn bản để phân tích.");
      return;
    }

    try {
      stopRequested.current = false;
      
      // Kiểm tra nếu văn bản đã thay đổi so với lần trước
      const isTextChanged = text !== lastTextRef.current;
      
      // ✅ Kiểm tra nếu văn bản đã có trong lịch sử phân tích
      const cachedAnalysis = analysisHistoryRef.current[text];
      
      // ✅ Kiểm tra trạng thái đã xử lý (đã trừ credits)
      const creditAlreadyDeducted = hasDeductedCredits(text);
      
      console.log(`📊 Trạng thái credits: ${creditAlreadyDeducted ? 'Đã trừ trước đó' : 'Chưa trừ'}`);
      
      // ===== BẮT ĐẦU: LOGIC KIỂM TRA CREDITS =====
      // Đếm số từ trong văn bản
      const wordCount = countWords(text);
      
      // Lấy thông tin người dùng từ localStorage
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      
      // Chỉ trừ credits khi chưa xử lý văn bản này trước đó
      if (!creditAlreadyDeducted) {
        // Kiểm tra và lấy thông tin người dùng
        if (user?.user_id) {
          const userInfoResult = await getCurrentUser(user.user_id);
          
          // Kiểm tra lấy thông tin người dùng thành công
          if (!userInfoResult.success) {
            toast.error("Không thể lấy thông tin người dùng", {
              position: "top-right",
              autoClose: 5000,
              theme: "light",
              transition: Bounce,
            });
            return;
          }

          // Lấy số credits từ response
          const userCredits = userInfoResult.data?.credits || 0;
          
          // Kiểm tra đủ credits không
          if (userCredits < wordCount) {
            toast.error(`Không đủ credits. Bạn cần ${wordCount} credits để chuyển văn bản thành giọng nói`, {
              position: "top-right",
              autoClose: 5000,
              theme: "light",
              transition: Bounce,
            });
            return;
          }

          // Trừ credits
          const creditsResult = await subtractUserCredits(user.user_id, wordCount);
          
          // Kiểm tra trừ credits thành công
          if (!creditsResult.success) {
            toast.error(creditsResult.error || "Không thể trừ credits", {
              position: "top-right",
              autoClose: 5000,
              theme: "light",
              transition: Bounce,
            });
            return;
          }
          
          console.log(`✅ Đã trừ ${wordCount} credits cho chuyển văn bản thành giọng nói`);
          
          // ✅ Lưu lịch sử giao dịch credits sau khi trừ credits thành công
          try {
            const historyResult = await saveCreditHistory(
              user.user_id,
              wordCount,
              "subtract",
              "text-to-speech" // Chỉ rõ là dùng cho tính năng text-to-speech
            );
            
            if (!historyResult.success) {
              console.warn("⚠️ Lưu lịch sử giao dịch không thành công:", historyResult.error);
            } else {
              console.log("✅ Đã lưu lịch sử giao dịch credits thành công");
            }
          } catch (creditHistoryError) {
            console.error("❌ Lỗi khi lưu lịch sử giao dịch credits:", creditHistoryError);
          }
          
          // Đánh dấu đã trừ credits cho văn bản này
          markAsDeducted(text);
          
          // Dispatch action để reset tiền trong Redux store
          dispatch(toggleAction());
        }
      } else {
        console.log("🔄 Văn bản đã được xử lý trước đó - không trừ credits");
      }
      // ===== KẾT THÚC: LOGIC KIỂM TRA CREDITS =====
      
      if (isTextChanged) {
        // Văn bản thay đổi: Xóa file audio cũ và ẩn nút tải xuống
        clearDownloadableAudio();
        setCanShowDownload(false);
      }
      
      // Phân tích ngôn ngữ (mới hoặc dùng lại kết quả cũ)
      let detectedLanguages;
      
      if (cachedAnalysis && cachedAnalysis.detectedLanguages) {
        // Sử dụng kết quả phân tích đã lưu trong cache
        console.log("🔄 Sử dụng kết quả phân tích ngôn ngữ từ bộ nhớ đệm");
        detectedLanguages = cachedAnalysis.detectedLanguages;
        
        // Thông báo sử dụng kết quả đã cache
        toast.info("Văn bản đã được phân tích trước đó, sử dụng kết quả đã lưu", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
          transition: Bounce,
        });
      } else if (!isTextChanged && lastResultRef.current) {
        // Sử dụng kết quả phân tích đã lưu từ lần trước
        console.log("🔄 Sử dụng kết quả phân tích ngôn ngữ từ lần trước");
        detectedLanguages = lastResultRef.current;
      } else {
        // Phân tích ngôn ngữ mới
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
        
        // Lưu kết quả mới vào bộ nhớ đệm
        lastTextRef.current = text;
        lastResultRef.current = detectedLanguages;
        
        setIsAnalyze(false);
      }
      
      // Phần phát âm thanh
      setIsSpeaking(true);

      // ✅ FIX: Phát âm thanh từ đầu đến cuối, không phụ thuộc vào cache audio
      // Tạo danh sách audio chunks và một đối tượng lưu trữ
      const allAudioChunks = [];
      
      // ✅ FIX: Lưu trữ audio chunks theo từng ngôn ngữ
      const chunksMap = {};
      
      let index = 0;
      for (const lang of detectedLanguages) {
        if (stopRequested.current) break;

        setCurrentLang(lang.name);
        console.log(`🎤 Phát: ${lang.text} (${lang.code})`);

        // ✅ FIX: Kiểm tra nếu đã có audio cho đoạn văn bản này trong cache
        const cachedAudioForLanguage = cachedAnalysis?.audioChunks?.[index];
        
        let audioData;
        
        if (cachedAudioForLanguage) {
          // Sử dụng audio từ cache
          console.log(`🔄 Sử dụng audio từ cache cho "${lang.text.substring(0, 20)}..."`);
          audioData = cachedAudioForLanguage;
        } else {
          // Tạo audio mới
          const audioBase64 = await textToSpeech(lang.text, lang.code);
          // Chuyển đổi Base64 thành Uint8Array
          audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
        }
        
        // Lưu dữ liệu audio
        allAudioChunks.push(audioData);
        chunksMap[index] = audioData;

        // Tạo Blob và URL để phát
        const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);
        
        audioRef.current = audio;

        await new Promise((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioURL); // Giải phóng URL ngay khi không dùng nữa
            setCurrentLang("");
            resolve();
          };
          audio.play().catch(error => {
            console.error("❌ Lỗi khi phát audio:", error);
            resolve();
          });
        });

        if (stopRequested.current) break;
        index++;
      }

      // Tạo file audio kết hợp tất cả ngôn ngữ để tải xuống
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
        
        // ✅ FIX: Lưu audio chunks theo từng ngôn ngữ
        audioChunksRef.current[text] = chunksMap;
        
        // ✅ Lưu kết quả vào lịch sử phân tích với từng chunks audio
        analysisHistoryRef.current[text] = {
          detectedLanguages,
          audioData: combinedAudio,
          audioChunks: chunksMap, // Lưu từng phần audio riêng biệt
          timestamp: new Date().getTime()
        };
        
        // ✅ Quản lý kích thước bộ nhớ đệm
        manageCacheSize();
        
        // Tạo Blob và URL để tải xuống
        const audioBlob = new Blob([combinedAudio], { type: "audio/mpeg" });
        const downloadURL = URL.createObjectURL(audioBlob);
        
        // Lưu URL để tải xuống
        setDownloadableAudio({
          url: downloadURL,
          filename: `audio_${new Date().toISOString().replace(/[:.]/g, "-")}.mp3`
        });
        
        console.log("💾 Đã tạo file audio để tải xuống");
        
        // Chỉ cho phép hiển thị nút tải xuống khi phát xong
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

  // ✅ Phần còn lại của code giữ nguyên...
  // Hàm quản lý kích thước bộ nhớ đệm
  const manageCacheSize = () => {
    const MAX_CACHE_ITEMS = 20; // Giới hạn số lượng mục lưu trong bộ nhớ đệm
    
    const historyEntries = Object.entries(analysisHistoryRef.current);
    
    if (historyEntries.length > MAX_CACHE_ITEMS) {
      // Sắp xếp theo thứ tự thời gian (cũ nhất trước)
      const sortedEntries = historyEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Xóa 20% các mục cũ nhất
      const itemsToRemove = Math.ceil(MAX_CACHE_ITEMS * 0.2);
      const newHistory = {};
      
      // Giữ lại các mục mới hơn
      sortedEntries.slice(itemsToRemove).forEach(([key, value]) => {
        newHistory[key] = value;
      });
      
      analysisHistoryRef.current = newHistory;
      console.log(`🧹 Đã xóa ${itemsToRemove} mục cũ khỏi bộ nhớ đệm`);
    }
  };

  // ✅ Thay đổi cách xử lý khi dừng sớm: không lưu cache
  const stopSpeaking = () => {
    stopRequested.current = true;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsSpeaking(false);
      setCurrentLang("");
      console.log("⏹ Đã dừng phát âm thanh.");
      
      // ✅ FIX: Khi dừng không lưu audio không đầy đủ vào cache
      // Chỉ đánh dấu là đã trừ credits
      const currentText = lastTextRef.current;
      if (currentText) {
        markAsDeducted(currentText);
      }
      
      // Khi dừng phát âm thanh, vẫn hiển thị nút tải xuống nếu có audio đầy đủ
      if (lastAudioRef.current && !stopRequested.current) {
        setCanShowDownload(true);
      }
    }
  };

  // Hàm xóa file audio tải xuống
  const clearDownloadableAudio = () => {
    if (downloadableAudio) {
      URL.revokeObjectURL(downloadableAudio.url);
      setDownloadableAudio(null);
    }
    setCanShowDownload(false);
    lastAudioRef.current = null;
  };

  // ✅ Thêm hàm xóa toàn bộ bộ nhớ đệm
  const clearAnalysisCache = () => {
    // Xóa tất cả các blob URL đã tạo trước khi xóa bộ nhớ đệm
    Object.values(analysisHistoryRef.current).forEach(item => {
      if (item.downloadURL) {
        URL.revokeObjectURL(item.downloadURL);
      }
    });
    
    // Xóa bộ nhớ đệm
    analysisHistoryRef.current = {};
    audioChunksRef.current = {};
    lastTextRef.current = "";
    lastResultRef.current = null;
    processedTextsRef.current = {}; // ✅ Xóa cả trạng thái đã xử lý
    
    // Xóa audio hiện tại
    clearDownloadableAudio();
    
    console.log("🗑️ Đã xóa tất cả bộ nhớ đệm phân tích và audio");
  };

  // Kiểm tra khi input text thay đổi
  useEffect(() => {
    // Nếu text thay đổi so với text đã lưu trong ref, thì xóa audio cũ
    if (currentText && lastTextRef.current && currentText !== lastTextRef.current) {
      console.log("📝 Input text thay đổi, xóa file audio cũ");
      clearDownloadableAudio();
      // Không cập nhật lastTextRef.current ở đây, để cho hàm analyzeAndSpeak xử lý
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentText]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      clearDownloadableAudio(); // Dọn dẹp URL khi unmount
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { 
    analyzeAndSpeak, 
    stopSpeaking, 
    isSpeaking, 
    isAnalyze, 
    currentLang, 
    downloadableAudio,
    clearDownloadableAudio,
    canShowDownload,
    hasAudio: !!lastAudioRef.current,
    clearAnalysisCache, // ✅ Export hàm xóa bộ nhớ đệm
    cacheSize: Object.keys(analysisHistoryRef.current).length // ✅ Thêm thông tin về kích thước bộ nhớ đệm
  };
};

export default useAnalyzeAndSpeech;