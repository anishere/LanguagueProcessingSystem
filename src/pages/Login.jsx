/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (location.state && location.state.message) {
            setSuccessMessage(location.state.message);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email.trim() === '' || password.trim() === '') {
            setError('Vui lòng nhập email và mật khẩu');
            return;
        }

        setIsLoading(true);
        try {
            const loginSuccess = await onLogin(email, password);
            if (!loginSuccess) {
                setError('Đăng nhập thất bại, vui lòng kiểm tra lại thông tin');
            }
        } catch (error) {
            setError('Có lỗi xảy ra khi đăng nhập');
            console.error('Login error:', error);
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
                            Login
                        </span>

                        {successMessage && (
                            <div className="text-center" style={{color: 'green', marginBottom: '15px'}}>
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="text-center" style={{color: 'red', marginBottom: '15px'}}>
                                {error}
                            </div>
                        )}

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
                            <span className="focus-input100" data-symbol="&#xf206;"></span>
                        </div>

                        <div className="wrap-input100 validate-input" data-validate="Password is required">
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
                        
                        <div className="text-right p-t-8 p-b-31">
                            <a href="#">
                                Forgot password?
                            </a>
                        </div>
                        
                        <div className="container-login100-form-btn">
                            <div className="wrap-login100-form-btn">
                                <div className="login100-form-bgbtn"></div>
                                <button 
                                    className="login100-form-btn" 
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Đang đăng nhập...' : 'Login'}
                                </button>
                            </div>
                        </div>

                        {/* Phần còn lại của form giữ nguyên */}
                        <div className="txt1 text-center p-t-54 p-b-20">
                            <span>
                                Or Sign Up Using
                            </span>
                        </div>

                        <div className="flex-c-m">
                            <a href="#" className="login100-social-item bg1">
                                <svg viewBox="0 0 320 512" width="16" height="16">
                                    <path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                                </svg>
                            </a>

                            <a href="#" className="login100-social-item bg2">
                                <svg viewBox="0 0 512 512" width="16" height="16">
                                    <path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                                </svg>
                            </a>

                            <a href="#" className="login100-social-item bg3">
                                <svg viewBox="0 0 488 512" width="16" height="16">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                </svg>
                            </a>
                        </div>

                        <div className="flex-col-c p-t-65">
                            <span className="txt1 p-b-17">
                                Or Sign Up Using
                            </span>

                            <Link to="/register" className="txt2">
                                Sign Up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;