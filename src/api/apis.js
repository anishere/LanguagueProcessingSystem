import axiosInstance from "../settings/axios";

export const translateText = async (text, targetLang) => {
  try {
    const response = await axiosInstance.get("/translate", {
      params: {
        text: text,
        src_lang: "auto", // Tự động nhận diện ngôn ngữ
        tgt_lang: targetLang, // Ngôn ngữ đích
      },
    });
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

    const response = await axiosInstance.post("/speech-to-text/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    return response; // { detected_language: "zh", transcript: "..." }
  } catch (error) {
    console.error("Error during speech-to-text:", error);
    throw error;
  }
};
