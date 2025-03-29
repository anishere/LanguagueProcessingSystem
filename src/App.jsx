import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import { Bounce, toast, ToastContainer } from 'react-toastify';
import TextPage from "./pages/TextPage";
import ImagePage from "./pages/ImagePage";
import FilePage from "./pages/FilePage";
import WebPage from "./pages/WebPage";
import AnalysisPage from "./pages/AnalysisPage";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Test from "./pages/Test";
import { loginUser, registerUser } from "./api/apis";
import Admin from "./pages/AdminPage/Admin";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Profile from "./pages/Profile";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessRedirect from './pages/PaymentSuccessRedirect';
import PaymentFailRedirect from './pages/PaymentFailRedirect';
import store from './redux/store'
import { Provider } from "react-redux";

//import { TranslationHistoryProvider } from "./contexts/TranslationHistoryContext";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Kiểm tra trạng thái đăng nhập từ localStorage khi khởi động
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const accountType = localStorage.getItem("account_type");
    
    if (isLoggedIn) {
      setIsLoggedIn(true);
      // Kiểm tra nếu là tài khoản admin
      if (accountType === "1") {
        setIsAdmin(true);
      }
    }
    setIsLoading(false);
  }, []);

  // Hàm đăng nhập
  const handleLogin = async (email, password) => {
    try {
      // Gọi API đăng nhập
      const result = await loginUser(email, password);

      if (result && result.success) {
        // Kiểm tra xem tài khoản có bị khóa không
        if (!result.data.user.is_active) {
          toast.error('Tài khoản của bạn đã bị khóa', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
          return false;
        }

        // Tài khoản đang hoạt động - xử lý đăng nhập thành công
        localStorage.setItem("user", JSON.stringify(result.data.user || {}));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("account_type", result.data.user.account_type);
        
        // Cập nhật trạng thái đăng nhập và quyền admin
        setIsLoggedIn(true);
        if (result.data.user.account_type === "1") {
          setIsAdmin(true);
        }
        
        return true;
      } else {
        console.error("Đăng nhập thất bại:", result.message);
        return false;
      }
    } catch (error) {
      console.error("Lỗi xử lý đăng nhập:", error);
      return false;
    }
  };

  // Hàm đăng ký
  const handleRegister = async (username, email, password) => {
    try {
      // Gọi API đăng ký
      const result = await registerUser(username, email, password);
      
      if (result.success) {
        return {
          success: true,
          message: "Đăng ký thành công! Vui lòng đăng nhập."
        };
      } else {
        return {
          success: false,
          message: result.message || "Đăng ký thất bại, vui lòng thử lại."
        };
      }
    } catch (error) {
      console.error("Lỗi xử lý đăng ký:", error);
      return {
        success: false,
        message: "Có lỗi xảy ra trong quá trình đăng ký."
      };
    }
  };

  // Hàm đăng xuất
  const handleLogout = () => {
    // Xóa token và thông tin người dùng
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("account_type");
    
    // Cập nhật trạng thái đăng nhập và quyền admin
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  // Hiển thị loading trong khi kiểm tra trạng thái
  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  // Components để xử lý các route khác nhau
  const AdminRoutes = () => {
    return (
      <div className="admin-layout">
        {/* Trang Admin hiển thị độc lập, không có container chung */}
        <Admin onLogout={handleLogout} />
      </div>
    );
  };

  // Component riêng cho trang Profile - Không bao gồm Navbar
  const ProfileRoutes = () => {
    return (
      <>
        <Header onLogout={handleLogout} />
        <Profile />
        <Footer />
      </>
    );
  };

  // Thêm component PaymentRoutes
  const PaymentRoutes = () => {
    return (
      <>
        <Header onLogout={handleLogout} />
        <PaymentPage />
        <Footer />
      </>
    );
  };

  const MainAppRoutes = () => {
    return (
      <>
        <Header onLogout={handleLogout} />
        <div className="container mt-3">
          <Navbar isAdmin={isAdmin} />

          <Routes>
            <Route path="/" element={<Navigate to="/text" />} />
            <Route path="/text" element={<TextPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/image" element={<ImagePage />} />
            <Route path="/file" element={<FilePage />} />
            <Route path="/web" element={<WebPage />} />
            <Route path="/test" element={<Test />} />
            {/* Đã loại bỏ route /profile khỏi đây */}
            {/* Redirect từ /admin vào trang chính nếu không có quyền admin */}
            <Route path="/admin/*" element={isAdmin ? <Navigate to="/admin" /> : <Navigate to="/text" />} />
          </Routes>
        </div>
        <Footer />
      </>
    );
  };

  return (
  <Provider store={store}>
    <Router>
      {!isLoggedIn ? (
        // Hiển thị trang Login hoặc Register nếu chưa đăng nhập
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        // Phân chia route giữa Admin, Profile và các trang chính
        <Routes>
          {/* Nếu là admin và truy cập vào /admin, hiển thị trang Admin riêng biệt */}
          <Route 
            path="/admin/*" 
            element={isAdmin ? <AdminRoutes /> : <Navigate to="/text" />} 
          />
          
          {/* Route cho trang Profile - chỉ hiển thị Header và Profile, không có Navbar */}
          <Route path="/profile" element={<ProfileRoutes />} />

          {/* Route cho trang Payment - chỉ hiển thị Header và PaymentPage, không có Navbar */}
          <Route path="/payment" element={<PaymentRoutes />} />

          <Route path="/payment/success" element={<>
            <Header onLogout={handleLogout} />
            <PaymentSuccessRedirect />
            <Footer />
          </>} />
          <Route path="/payment/fail" element={<>
            <Header onLogout={handleLogout} />
            <PaymentFailRedirect />
            <Footer />
          </>} />
          
          {/* Tất cả các route khác sẽ vào layout chính */}
          <Route path="/*" element={<MainAppRoutes />} />
        </Routes>
      )}
    </Router>
    <ToastContainer />
  </Provider>
  );
}

export default App;