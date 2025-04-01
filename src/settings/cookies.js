import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

// Secret key cho việc mã hóa và xác thực dữ liệu
// Trong môi trường thực tế, nên lưu key này trong biến môi trường (.env)
const SECRET_KEY = 'secret-key-9823465789-AnTranslate';

// Cấu hình chung cho cookies
const cookieOptions = {
  expires: 7, // Cookies tồn tại 7 ngày
  secure: window.location.protocol === 'https:', // Chỉ gửi qua HTTPS nếu site đang dùng HTTPS
  sameSite: 'strict' // Ngăn cross-site request forgery attacks
};

// Mã hóa dữ liệu trước khi lưu vào cookie
const encryptData = (data) => {
  try {
    // Chuyển đổi data thành chuỗi JSON
    const jsonData = JSON.stringify(data);
    
    // Mã hóa dữ liệu
    const encryptedData = CryptoJS.AES.encrypt(jsonData, SECRET_KEY).toString();
    
    // Tạo chữ ký để xác minh tính toàn vẹn
    const signature = CryptoJS.HmacSHA256(encryptedData, SECRET_KEY).toString();
    
    // Trả về dữ liệu đã mã hóa và chữ ký
    return {
      data: encryptedData,
      signature
    };
  } catch (error) {
    console.error('Lỗi khi mã hóa dữ liệu:', error);
    return null;
  }
};

// Giải mã và xác thực dữ liệu từ cookie
const decryptData = (encryptedObj) => {
  try {
    if (!encryptedObj || !encryptedObj.data || !encryptedObj.signature) {
      return null;
    }
    
    // Kiểm tra tính toàn vẹn bằng cách xác minh chữ ký
    const expectedSignature = CryptoJS.HmacSHA256(encryptedObj.data, SECRET_KEY).toString();
    if (expectedSignature !== encryptedObj.signature) {
      console.error('Chữ ký xác thực không hợp lệ! Cookie có thể đã bị giả mạo.');
      return null;
    }
    
    // Giải mã dữ liệu
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedObj.data, SECRET_KEY);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    // Parse dữ liệu JSON
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Lỗi khi giải mã dữ liệu:', error);
    return null;
  }
};

// Hàm lưu cookie đã được mã hóa
export const setCookie = (key, value) => {
  // Mã hóa dữ liệu trước khi lưu
  const encryptedObj = encryptData(value);
  if (encryptedObj) {
    Cookies.set(key, JSON.stringify(encryptedObj), cookieOptions);
  }
};

// Hàm đọc cookie và giải mã
export const getCookie = (key) => {
  const cookie = Cookies.get(key);
  if (!cookie) return null;
  
  try {
    // Parse dữ liệu cookie thành object
    const encryptedObj = JSON.parse(cookie);
    
    // Giải mã và xác thực dữ liệu
    return decryptData(encryptedObj);
  } catch {
    // Nếu parse thất bại, có thể cookie là chuỗi thông thường
    return cookie;
  }
};

// Hàm xóa cookie
export const removeCookie = (key) => {
  Cookies.remove(key, cookieOptions);
};

// Các key cho cookies
export const COOKIE_KEYS = {
  USER: 'user_data',
  IS_LOGGED_IN: 'is_logged_in',
  ACCOUNT_TYPE: 'account_type'
};

// Hàm xóa tất cả cookies liên quan đến authentication
export const clearAuthCookies = () => {
  Object.values(COOKIE_KEYS).forEach(key => {
    removeCookie(key);
  });
}; 