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
    const navigate = useNavigate();

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
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
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

                        {/* Password field */}
                        <div className="wrap-input100 validate-input m-b-23" data-validate="Password is required">
                            <span className="label-input100">Password</span>
                            <input 
                                className={`input100 ${password ? 'has-val' : ''}`} 
                                type="password" 
                                name="password" 
                                placeholder="Type your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className="focus-input100" data-symbol="&#xf190;"></span>
                        </div>

                        {/* Confirm Password field */}
                        <div className="wrap-input100 validate-input m-b-23" data-validate="Confirm password is required">
                            <span className="label-input100">Confirm Password</span>
                            <input 
                                className={`input100 ${confirmPassword ? 'has-val' : ''}`} 
                                type="password" 
                                name="confirmPassword" 
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <span className="focus-input100" data-symbol="&#xf190;"></span>
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