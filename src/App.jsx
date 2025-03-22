import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import TextPage from "./pages/TextPage";
import ImagePage from "./pages/ImagePage";
import FilePage from "./pages/FilePage";
import WebPage from "./pages/WebPage";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Test from "./pages/Test";
import { loginUser, registerUser } from "./api/apis";
import Admin from "./pages/AdminPage/Admin";

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
      
      if (result.success) {
        // Lưu token và thông tin người dùng vào localStorage
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

  const MainAppRoutes = () => {
    return (
      <div className="container">
        <h1 className="text-center text-primary mb-4">
          Translate AI
          <button 
            onClick={handleLogout}
            className="btn btn-outline-danger ms-3"
            style={{ fontSize: '0.8rem', verticalAlign: 'middle' }}
          >
            Đăng xuất
          </button>
        </h1>

        <Navbar isAdmin={isAdmin} />

        <Routes>
          <Route path="/" element={<Navigate to="/text" />} />
          <Route path="/text" element={<TextPage />} />
          <Route path="/image" element={<ImagePage />} />
          <Route path="/file" element={<FilePage />} />
          <Route path="/web" element={<WebPage />} />
          <Route path="/test" element={<Test />} />
          {/* Redirect từ /admin vào trang chính nếu không có quyền admin */}
          <Route path="/admin/*" element={isAdmin ? <Navigate to="/admin" /> : <Navigate to="/text" />} />
        </Routes>
      </div>
    );
  };

  return (
    <Router>
      {!isLoggedIn ? (
        // Hiển thị trang Login hoặc Register nếu chưa đăng nhập
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        // Phân chia route giữa Admin và các trang chính
        <Routes>
          {/* Nếu là admin và truy cập vào /admin, hiển thị trang Admin riêng biệt */}
          <Route 
            path="/admin/*" 
            element={isAdmin ? <AdminRoutes /> : <Navigate to="/text" />} 
          />
          
          {/* Tất cả các route khác sẽ vào layout chính */}
          <Route path="/*" element={<MainAppRoutes />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;