import { useState, useRef } from "react";
import { 
  speechToText, 
  getCurrentUser, 
  subtractUserCredits,
  saveCreditHistory // ✅ Thêm import hàm saveCreditHistory
} from "../api/apis";
import { Bounce, toast } from "react-toastify";
import { useDispatch } from "react-redux"; 
import { toggleAction } from "../redux/actionSlice";
import { getCookie, COOKIE_KEYS } from '../settings/cookies';

const useSpeechToText = (setInputText) => {
  const [isRecording, setIsRecording] = useState(false);
  const [detectVoice, setDetectVoice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartTimeRef = useRef(null); // ✅ Thêm ref để lưu thời gian bắt đầu ghi âm
  
  // ✅ Thêm dispatch từ Redux
  const dispatch = useDispatch();

  // ✅ Hàm ước tính số credits dựa trên thời gian ghi âm (tính bằng giây)
  const estimateCredits = (durationInSeconds) => {
    // Speech-to-text rẻ hơn phân nửa so với text, tính phí là độ dài (giây) chia 2
    // Làm tròn xuống và đảm bảo ít nhất là 1 credit
    return Math.max(1, Math.floor(durationInSeconds / 2));
  };

  const startRecording = async () => {
    try {
      console.log("🎤 Đang yêu cầu quyền microphone...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Đã cấp quyền microphone!");

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // ✅ Lưu thời gian bắt đầu ghi âm
      recordingStartTimeRef.current = new Date();

      mediaRecorder.ondataavailable = (event) => {
        console.log("🔹 Đã nhận dữ liệu âm thanh:", event.data);
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("⏹ Ghi âm kết thúc!");
        setIsRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });

        // ✅ Tính toán thời lượng ghi âm (tính bằng giây)
        const recordingEndTime = new Date();
        const durationInSeconds = (recordingEndTime - recordingStartTimeRef.current) / 1000;
        console.log(`🕒 Thời lượng ghi âm: ${durationInSeconds.toFixed(2)} giây`);
        
        // ✅ Ước tính số credits cần thiết
        const creditsRequired = estimateCredits(durationInSeconds);
        console.log(`💰 Số credits cần thiết: ${creditsRequired}`);
        
        // ✅ THÊM LOGIC KIỂM TRA CREDITS
        // Lấy thông tin người dùng từ cookies
        const userCookie = getCookie(COOKIE_KEYS.USER);
        const userId = userCookie?.user_id;
        
        if (userId) {
          try {
            // Kiểm tra thông tin người dùng
            const userInfoResult = await getCurrentUser(userId);
            
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
            if (userCredits < creditsRequired) {
              toast.error(`Không đủ credits. Bạn cần ${creditsRequired} credits để chuyển giọng nói thành văn bản`, {
                position: "top-right",
                autoClose: 5000,
                theme: "light",
                transition: Bounce,
              });
              return;
            }

            // Trừ credits
            const creditsResult = await subtractUserCredits(userId, creditsRequired);
            
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
            
            console.log(`✅ Đã trừ ${creditsRequired} credits cho chuyển giọng nói thành văn bản`);
            
            // ✅ THÊM: Lưu lịch sử giao dịch credits sau khi trừ credits thành công
            try {
              const historyResult = await saveCreditHistory(
                userId,
                creditsRequired,
                "subtract",
                "speech-to-text" // Chỉ rõ là dùng cho tính năng speech-to-text
              );
              
              if (!historyResult.success) {
                console.warn("⚠️ Lưu lịch sử giao dịch không thành công:", historyResult.error);
                // Không return ở đây để không ảnh hưởng đến quá trình xử lý chính
              } else {
                console.log("✅ Đã lưu lịch sử giao dịch credits thành công");
              }
            } catch (creditHistoryError) {
              console.error("❌ Lỗi khi lưu lịch sử giao dịch credits:", creditHistoryError);
              // Không return ở đây để không ảnh hưởng đến quá trình xử lý chính
            }
            
            // Dispatch action để reset tiền trong Redux store
            dispatch(toggleAction());
          } catch (error) {
            console.error("❌ Lỗi khi kiểm tra hoặc trừ credits:", error);
            toast.error("Đã xảy ra lỗi khi xử lý credits", {
              position: "top-right",
              autoClose: 5000,
              theme: "light",
              transition: Bounce,
            });
            return;
          }
        }
        // ✅ KẾT THÚC LOGIC KIỂM TRA CREDITS

        console.log("🔹 Gửi audioBlob đến API:", audioBlob);
        setIsLoading(true);

        try {
          const result = await speechToText(audioBlob);
          console.log("✅ Kết quả Speech-to-Text:", result);
          
          // Làm sạch văn bản trước khi đặt vào input
          let cleanTranscript = result.transcript || "";
          
          // Loại bỏ ký tự đặc biệt và chuẩn hóa khoảng trắng
          cleanTranscript = cleanTranscript.trim()
            .replace(/[^\S\r\n]+/g, ' ') // Thay thế nhiều khoảng trắng bằng một khoảng trắng
            .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, ''); // Chỉ giữ lại chữ cái, số, dấu câu và khoảng trắng
          
          console.log("🧹 Văn bản sau khi làm sạch:", cleanTranscript);
          
          // Cập nhật input text với văn bản đã làm sạch
          setInputText((prev) => {
            const newText = prev ? `${prev.trim()} ${cleanTranscript}` : cleanTranscript;
            return newText;
          });
          
          setDetectVoice(result.detected_language);
        } catch (error) {
          console.error("❌ Speech-to-text thất bại:", error);
          toast.error("Không thể chuyển đổi giọng nói thành văn bản", {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
            transition: Bounce,
          });
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      console.log("🎙 Ghi âm bắt đầu!");
      setIsRecording(true);
    } catch (error) {
      console.error("❌ Không thể truy cập microphone:", error);
      toast.error("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
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