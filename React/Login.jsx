import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import backgroundImage from '../../assets/login/background.jpg';
import { login, logout } from '../../services/Login_api';
import Cookies from 'js-cookie';

const Login = () => {
    //帳號密碼
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    //預設帳號密碼
    //const correctUsername = 'admin';
    //const correctPassword = '123';

    //登入
    const handleLogin = async () => {
        try {
            const response = await login(username, password);
            if (response.success) {
                alert(response.message); // 成功訊息

                // 設置 Cookies 紀錄登入狀態與使用者名稱
                Cookies.set('isLoggedIn', true, { expires: 1 }); // 設置有效期 1 天(或可以再調整？)
                Cookies.set('username', username, { expires: 1 });

                navigate('/'); // 至首頁
            } else {
                // 帳號或密碼錯誤，或者伺服器錯誤
                alert(response.message || '發生未知錯誤'); // 提示 API 回應的錯誤訊息
            }
        } catch (error) {
            // 處理網路問題或伺服器無回應等情況
            alert(error.message || '無法連線至伺服器，請稍後再試');
        }
    };

    //登出
    const handleLogout = () => {
        logout();
        navigate('/Login'); // 登出後至登入頁面
    };

    // 使用全域 Cookies
    const isLoggedIn = Cookies.get('isLoggedIn');
    const savedUsername = Cookies.get('username');

    //回傳畫面
    return (
        <div id="returnPlace">
            {/* 背景圖片容器 */}
            <div className="background-container">
                <img src={backgroundImage} alt="背景" className="background-image" />
            </div>

            {/* 頁首 */}
            <Header />

            {/* 登入 */}
            <div className="login-container">
                {isLoggedIn ? (
                    <div>
                        <h3>{savedUsername}</h3>
                        <button onClick={handleLogout}>登出</button>
                    </div>
                ) : (
                    <div className="login-box">
                        <div className="input-group">
                            <label htmlFor="username" className="input-label">帳號</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password" className="input-label">密碼</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button id="start" onClick={handleLogin}>登入</button>
                        <a href="https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Main/Index_student.aspx">忘記密碼</a>
                    </div>
                )}
            </div>

            {/* 頁尾 */}
            <Footer />
        </div>
    );
};

export default Login;