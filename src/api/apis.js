import axiosInstance from "../settings/axios";

const APIKey = import.meta.env.VITE_API_CODE;

export const translateText = async (text, targetLang) => {
  console.log("text: ", text, "targetLang: ", targetLang);
  try {
    const response = await axiosInstance.post(
      "/translateAI/translate",
      {
        text: text,
        src_lang: "Auto", // Tự động nhận diện ngôn ngữ
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

export const extractText = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile); // Thêm file ảnh vào FormData

    const response = await axiosInstance.post(
      "/imgToText/extract",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "API-Key": APIKey, // Thêm API-Key vào header
        },
      }
    );

    return response.extracted_text
  } catch (error) {
    console.error("Error during text extraction from image:", error);
    throw error;
  }
};

//  Database

// Hàm đăng nhập sử dụng API
export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post(
      "/auth/login",
      {
        email: email,
        password: password,
      },
      {
        headers: {
          "API-Key": APIKey,
          "Content-Type": "application/json",
        },
      }
    );
    
    // Trả về dữ liệu từ response, bao gồm token nếu có
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Đăng nhập thất bại"
    };
  }
};

// Thêm hàm đăng ký
export const registerUser = async (username, email, password) => {
  try {
    const response = await axiosInstance.post(
      "/auth/register",
      {
        username, // Tham số username được thêm theo cấu trúc API
        email,
        password
      },
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response,
      message: "Đăng ký thành công! Vui lòng đăng nhập."
    };
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return {
      success: false,
      message: error.response?.data?.detail || "Đăng ký thất bại",
      statusCode: error.response?.status || 500
    };
  }
};

// Hàm đặt lại mật khẩu (không cần mật khẩu cũ)
export const resetUserPassword = async (userId, newPassword) => {
  try {
    const response = await axiosInstance.put(
      `/auth/reset-password/${userId}`,
      {
        new_password: newPassword
      },
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response.data,
      message: "Đặt lại mật khẩu thành công!"
    };
  } catch (error) {
    console.error("Lỗi khi đặt lại mật khẩu:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Đặt lại mật khẩu thất bại"
    };
  }
};

// Hàm lấy thông tin người dùng hiện tại
export const getCurrentUser = async (userId) => {
  try {
    const response = await axiosInstance.get(
      `/auth/me/${userId}`,
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json"
        }
      }
    );
    return {
      success: true,
      data: response,
      message: "Lấy thông tin người dùng thành công"
    };
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Lấy thông tin người dùng thất bại"
    };
  }
};

// Hàm lấy danh sách tất cả người dùng
export const getAllUsers = async (skip = 0, limit = 100) => {
  try {
    const response = await axiosInstance.get("/auth/users", {
      params: {
        skip,
        limit
      },
      headers: {
        "API-Key": APIKey,
        "accept": "application/json"
      }
    });
    
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Không thể lấy danh sách người dùng"
    };
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(
      `/auth/profile/${userId}`,
      {
        username: userData.username,
        email: userData.email
      },
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response.data,
      message: "Cập nhật thông tin thành công!"
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Cập nhật thông tin thất bại"
    };
  }
};

export const changeAccountType = async (userId, isAdmin) => {
  try {
    const response = await axiosInstance.put(
      `/auth/change-account-type/${userId}`,
      {
        account_type: isAdmin ? "1" : "0"
      },
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response.data,
      message: `Đã chuyển thành tài khoản ${isAdmin ? "Admin" : "User"}!`
    };
  } catch (error) {
    console.error("Lỗi khi thay đổi loại tài khoản:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Thay đổi loại tài khoản thất bại"
    };
  }
};

export const updateActiveStatus = async (userId, isActive) => {
  try {
    // Chuyển đổi isActive thành số để đảm bảo API nhận đúng kiểu dữ liệu
    const statusValue = isActive ? 1 : 0;
    
    console.log(`Gửi API cập nhật trạng thái: userId=${userId}, is_active=${statusValue}`);
    
    const response = await axiosInstance.put(
      `/auth/update-active-status/${userId}`,
      {
        is_active: statusValue
      },
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response,
      message: `Đã ${statusValue === 1 ? "kích hoạt" : "vô hiệu hóa"} tài khoản!`
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    console.error("Response error:", error.response?.data);
    return {
      success: false,
      error: error.response?.data?.detail || "Cập nhật trạng thái thất bại"
    };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(
      `/auth/delete/${userId}`,
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response.data,
      message: "Đã xóa tài khoản thành công!"
    };
  } catch (error) {
    console.error("Lỗi khi xóa tài khoản:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Xóa tài khoản thất bại"
    };
  }
};

// Hàm cộng credits cho người dùng
export const addUserCredits = async (userId, amount) => {
  try {
    const response = await axiosInstance.put(
      `/auth/add-credits/${userId}`,
      {
        amount: amount
      },
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response,
      message: response.message || "Đã cộng credits thành công!"
    };
  } catch (error) {
    console.error("Lỗi khi cộng credits:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Cộng credits thất bại"
    };
  }
};

// Hàm trừ credits từ người dùng
export const subtractUserCredits = async (userId, amount) => {
  try {
    const response = await axiosInstance.put(
      `/auth/subtract-credits/${userId}`,
      {
        amount: amount
      },
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );

    return {
      success: true,
      data: response,
      message: response.message || "Đã trừ credits thành công!"
    };
  } catch (error) {
    console.error("Lỗi khi trừ credits:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Trừ credits thất bại"
    };
  }
};

// Lưu lịch sử giao dịch credits
export const saveCreditHistory = async (userId, amount, transactionType, paymentMethod = "admin") => {
  try {
    const response = await axiosInstance.post(
      "/history/credit/",
      {
        user_id: userId,
        amount: amount,
        transaction_type: transactionType, // "purchase" hoặc "subtract"
        payment_method: paymentMethod
      },
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response,
      message: response.message || "Đã lưu lịch sử giao dịch credits thành công"
    };
  } catch (error) {
    console.error("Lỗi khi lưu lịch sử giao dịch:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Lưu lịch sử giao dịch thất bại"
    };
  }
};

// Lấy lịch sử giao dịch credits
export const getCreditHistory = async (userId = null, skip = 0, limit = 100, sortByDate = 'desc') => {
  try {
    // Xây dựng tham số query
    let queryParams = `skip=${skip}&limit=${limit}&sort_by_date=${sortByDate}`;
    
    // Thêm user_id vào query nếu có
    if (userId) {
      queryParams += `&user_id=${userId}`;
    }
    
    const response = await axiosInstance.get(
      `/history/credit/?${queryParams}`,
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json"
        }
      }
    );
    console.log(response)
    return {
      success: true,
      data: response,
      items: response.items || [],
      total: response.total || 0
    };
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử giao dịch:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Lấy lịch sử giao dịch thất bại",
      items: [],
      total: 0
    };
  }
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await axiosInstance.put(
      `/auth/change-password/${userId}`,
      {
        current_password: currentPassword,
        new_password: newPassword
      },
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    
    return {
      success: true,
      message: response.message || "Đổi mật khẩu thành công!"
    };
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Đổi mật khẩu thất bại"
    };
  }
};

// Lấy lịch sử dịch thuật
export const getTranslationHistory = async (userId, skip = 0, limit = 100, sortByDate = 'desc') => {
  try {
    const queryParams = `user_id=${userId}&skip=${skip}&limit=${limit}&sort_by_date=${sortByDate}`;
    
    const response = await axiosInstance.get(
      `/history/translation/?${queryParams}`,
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response,
      items: response.items || [],
      total: response.total || 0
    };
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử dịch thuật:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Lấy lịch sử dịch thuật thất bại",
      items: [],
      total: 0
    };
  }
};

// Lưu lịch sử dịch thuật
export const saveTranslationHistory = async (userId, inputText, outputText, sourceLanguage, targetLanguage) => {
  try {
    const response = await axiosInstance.post(
      "/history/translation/",
      {
        user_id: userId,
        input_text: inputText,
        output_text: outputText,
        source_language: sourceLanguage,
        target_language: targetLanguage
      },
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response,
      message: response.message || "Đã lưu lịch sử dịch thành công",
      credits_used: response.credits_used,
      translation_id: response.translation_id
    };
  } catch (error) {
    console.error("Lỗi khi lưu lịch sử dịch thuật:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Lưu lịch sử dịch thất bại"
    };
  }
};

// Xóa một lịch sử dịch thuật
export const deleteTranslationHistory = async (historyId, userId) => {
  try {
    const response = await axiosInstance.delete(
      `/history/translation/${historyId}?user_id=${userId}`,
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response,
      message: response.message || "Đã xóa bản ghi lịch sử thành công"
    };
  } catch (error) {
    console.error("Lỗi khi xóa lịch sử dịch thuật:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Xóa lịch sử dịch thất bại"
    };
  }
};

// Xóa tất cả lịch sử dịch thuật
export const deleteAllTranslationHistory = async (userId) => {
  try {
    const response = await axiosInstance.delete(
      `/history/translation/delete-all?user_id=${userId}`,
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response,
      message: response.message || "Đã xóa tất cả bản ghi lịch sử dịch thuật",
      deleted_count: response.deleted_count
    };
  } catch (error) {
    console.error("Lỗi khi xóa tất cả lịch sử dịch thuật:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Xóa tất cả lịch sử dịch thất bại"
    };
  }
};

// payment

// Hàm tạo liên kết thanh toán
export const createPayment = async (amount, description) => {
  try {
    const response = await axiosInstance.post(
      "/payments/create-payment",
      {
        amount: amount,
        description: description
      },
      {
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    return {
      success: true,
      data: response,
      message: "Tạo liên kết thanh toán thành công"
    };
  } catch (error) {
    console.error("Lỗi khi tạo thanh toán:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Tạo thanh toán thất bại"
    };
  }
};

// Hàm kiểm tra trạng thái thanh toán
export const checkPaymentStatus = async (orderCode) => {
  try {
    const response = await axiosInstance.post(
      "/payments/check-payment",
      {
        order_code: orderCode
      },
      {
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    return {
      success: true,
      data: response,
      message: "Kiểm tra trạng thái thành công"
    };
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Kiểm tra trạng thái thất bại"
    };
  }
};

// Hàm lấy thông tin cấu hình
export const getConfig = async () => {
  try {
    const response = await axiosInstance.get(
      "/config/",
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error("Lỗi khi lấy thông tin cấu hình:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Không thể lấy thông tin cấu hình",
      data: null
    };
  }
};

// Hàm cập nhật cấu hình
export const updateConfig = async (configData) => {
  try {
    const response = await axiosInstance.put(
      "/config/",
      configData,
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response,
      message: response.message || "Cập nhật cấu hình thành công"
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật cấu hình:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Cập nhật cấu hình thất bại",
      data: null
    };
  }
};

// Lấy lịch sử doanh thu (tất cả giao dịch nạp tiền)
export const getRevenueHistory = async (skip = 0, limit = 100, sortByDate = 'desc', startDate = null, endDate = null) => {
  try {
    // Xây dựng tham số query
    let queryParams = `skip=${skip}&limit=${limit}&sort_by_date=${sortByDate}`;
    
    // Thêm tham số ngày nếu có
    if (startDate) {
      queryParams += `&start_date=${startDate}`;
    }
    if (endDate) {
      queryParams += `&end_date=${endDate}`;
    }
    
    const response = await axiosInstance.get(
      `/history/credit/revenue?${queryParams}`,
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json"
        }
      }
    );
    
    return {
      success: true,
      data: response,
      items: response.items || [],
      total: response.total || 0,
      totalRevenue: response.total_revenue || 0
    };
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử doanh thu:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Lấy lịch sử doanh thu thất bại",
      items: [],
      total: 0,
      totalRevenue: 0
    };
  }
};

// Hàm lấy tất cả lịch sử giao dịch credits (không phụ thuộc vào user_id)
export const getAllCreditHistory = async (skip = 0, limit = 10, sortOrder = 'desc', startDate = null, endDate = null, transactionType = null) => {
  try {
    // Xây dựng tham số query
    let queryParams = `skip=${skip}&limit=${limit}&sort_order=${sortOrder}`;
    
    if (startDate) {
      queryParams += `&start_date=${startDate}`;
    }
    
    if (endDate) {
      queryParams += `&end_date=${endDate}`;
    }
    
    if (transactionType) {
      queryParams += `&transaction_type=${transactionType}`;
    }
    
    const response = await axiosInstance.get(
      `/history/credit/all?${queryParams}`,
      {
        headers: {
          "API-Key": APIKey,
          "accept": "application/json"
        }
      }
    );
    
    return {
      success: true,
      items: response.items || [],
      total: response.total || 0,
      totalAmount: response.total_purchase || 0,
      totalUsage: response.total_usage || 0
    };
  } catch (error) {
    console.error('Error fetching all credit history:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Đã xảy ra lỗi khi lấy lịch sử giao dịch',
      items: [],
      total: 0,
      totalAmount: 0,
      totalUsage: 0
    };
  }
};