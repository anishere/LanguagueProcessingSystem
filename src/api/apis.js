import axiosInstance from "../settings/axios";

const APIKey = import.meta.env.VITE_API_CODE;

export const translateText = async (text, targetLang) => {
  console.log("text: ", text, "targetLang: ", targetLang);
  try {
    const response = await axiosInstance.post(
      "/translateAI/translate",
      {
        text: text,
        src_lang: "auto", // Tự động nhận diện ngôn ngữ
        tgt_lang: targetLang, // Ngôn ngữ đích
      },
      {
        headers: {
          "API-Key": APIKey, // Thêm API-Key vào header
        },
      }
    );
    return response.translated_text;
  } catch (error) {
    console.error("Error during translation:", error);
    throw error;
  }
};

export const speechToText = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "recorded_audio.wav");

    const response = await axiosInstance.post(
      "/api/speech-to-text/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "API-Key": APIKey, 
        },
      }
    );

    return response; // { detected_language: "zh", transcript: "..." }
  } catch (error) {
    console.error("Error during speech-to-text:", error);
    throw error;
  }
};

export const textToSpeech = async (text, lang = "vi") => {
  try {
    const response = await axiosInstance.post(
      "/textToSpeechAI/textToSpeech",
      { text, lang },
      { headers: { "API-Key": APIKey } }
    );

    return response.audio_base64; // Trả về chuỗi Base64 của file âm thanh
  } catch (error) {
    console.error("Error during text-to-speech:", error);
    throw error;
  }
};

export const analyzeLanguage = async (text) => {
  try {
    const response = await axiosInstance.post(
      "/analyzeAI/analyze",
      { text },
      { headers: { "API-Key": APIKey } }
    );

    return response.language; // ✅ Trả về danh sách ngôn ngữ nhận diện được
  } catch (error) {
    console.error("Error during language analysis:", error);
    throw error;
  }
};