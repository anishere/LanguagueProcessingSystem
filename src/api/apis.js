import axiosInstance from "../settings/axios";

const APIKey = import.meta.env.VITE_API_CODE;

export const translateText = async (text, targetLang) => {
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
