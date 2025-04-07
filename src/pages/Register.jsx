/* eslint-disable no-unused-vars */
// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../pages/Login.css'; // Đường dẫn tới CSS của Login

// eslint-disable-next-line react/prop-types
function Register({ onRegister }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Thêm state để theo dõi trạng thái hiển thị của mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const navigate = useNavigate();

    // Thêm hàm toggle cho mật khẩu chính
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Thêm hàm toggle cho mật khẩu xác nhận
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra form
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        
        // Kiểm tra email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Email không hợp lệ');
            return;
        }
        
        // Kiểm tra mật khẩu khớp nhau
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        
        // Kiểm tra độ dài mật khẩu
        if (password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        // Kiểm tra mật khẩu có bao gồm số, chữ thường, chữ hoa và ký tự đặc biệt không
        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
        if (!regex.test(password)) {
            setError('Mật khẩu phải bao gồm số, chữ hoa, chữ thường và ký tự đặc biệt');
            return;
        }

        setIsLoading(true);
        
        try {
            const result = await onRegister(username, email, password);
            
            if (result.success) {
                // Đăng ký thành công - chuyển đến trang đăng nhập
                navigate('/login', { state: { message: result.message } });
            } else {
                // Hiển thị lỗi từ server
                setError(result.message);
            }
        } catch (error) {
            setError('Đã xảy ra lỗi trong quá trình đăng ký');
            console.error('Register error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="limiter">
            <div className="container-login100" style={{ backgroundImage: "url('src/assets/imgs/bg-01.jpg')" }}>
                <div className="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54">
                    <form className="login100-form validate-form" onSubmit={handleSubmit}>
                        <span className="login100-form-title p-b-31">
                            Register
                        </span>

                        {error && (
                            <div className="text-center" style={{color: 'red', marginBottom: '15px'}}>
                                {error}
                            </div>
                        )}

                        {/* Username field */}
                        <div className="wrap-input100 validate-input m-b-23" data-validate="Username is required">
                            <span className="label-input100">Username</span>
                            <input 
                                className={`input100 ${username ? 'has-val' : ''}`} 
                                type="text" 
                                name="username" 
                                placeholder="Type your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <span className="focus-input100" data-symbol="&#xf206;"></span>
                        </div>

                        {/* Email field */}
                        <div className="wrap-input100 validate-input m-b-23" data-validate="Email is required">
                            <span className="label-input100">Email</span>
                            <input 
                                className={`input100 ${email ? 'has-val' : ''}`} 
                                type="email" 
                                name="email" 
                                placeholder="Type your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <span className="focus-input100" data-symbol="&#x2709;"></span>
                        </div>

                        {/* Password field - Thêm chức năng ẩn/hiện mật khẩu */}
                        <div className="wrap-input100 validate-input m-b-23" data-validate="Password is required">
                            <span className="label-input100">Password</span>
                            <input 
                                className={`input100 ${password ? 'has-val' : ''}`} 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                placeholder="Type your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className="focus-input100" data-symbol="&#xf190;"></span>
                            
                            {/* Nút toggle hiển thị/ẩn mật khẩu với biểu tượng con mắt */}
                            <button 
                                type="button"
                                className="password-toggle-btn"
                                onClick={togglePasswordVisibility}
                                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? (
                                    // Biểu tượng mắt nhắm (đang hiển thị mật khẩu, nhấn để ẩn)
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    // Biểu tượng mắt mở (đang ẩn mật khẩu, nhấn để hiển thị)
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Confirm Password field - Thêm chức năng ẩn/hiện mật khẩu */}
                        <div className="wrap-input100 validate-input m-b-23" data-validate="Confirm password is required">
                            <span className="label-input100">Confirm Password</span>
                            <input 
                                className={`input100 ${confirmPassword ? 'has-val' : ''}`} 
                                type={showConfirmPassword ? "text" : "password"} 
                                name="confirmPassword" 
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <span className="focus-input100" data-symbol="&#xf190;"></span>
                            
                            {/* Nút toggle hiển thị/ẩn mật khẩu xác nhận với biểu tượng con mắt */}
                            <button 
                                type="button"
                                className="password-toggle-btn"
                                onClick={toggleConfirmPasswordVisibility}
                                aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                            >
                                {showConfirmPassword ? (
                                    // Biểu tượng mắt nhắm (đang hiển thị mật khẩu, nhấn để ẩn)
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    // Biểu tượng mắt mở (đang ẩn mật khẩu, nhấn để hiển thị)
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        
                        <div className="container-login100-form-btn" style={{ marginTop: '30px' }}>
                            <div className="wrap-login100-form-btn">
                                <div className="login100-form-bgbtn"></div>
                                <button 
                                    className="login100-form-btn" 
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Đang xử lý...' : 'Register'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-col-c p-t-65">
                            <span className="txt1 p-b-17">
                                Already have an account?
                            </span>

                            <Link to="/login" className="txt2">
                                Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;