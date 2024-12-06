import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import backgroundImage from '../../assets/login/background.jpg';
import { login, logout } from '../../services/Login_api';

const Login = () => {
    //帳號密碼
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [savedUsername, setSavedUsername] = useState('');
    const navigate = useNavigate();

    // 檢查伺服器端的登入狀態
    useEffect(() => {
        const verifyLoginStatus = async () => {
            try {
                const response = await login(); // 呼叫後端 API 檢查登入狀態
                if (response.isLoggedIn) {
                    setIsLoggedIn(true);
                    setSavedUsername(response.username); // 更新畫面顯示的使用者名稱
                } else {
                    setIsLoggedIn(false);
                    setSavedUsername('');
                }
            } catch (error) {
                console.error('無法檢查登入狀態:', error.message);
            }
        };

        verifyLoginStatus(); // 初始執行檢查
    }, []);

    //登入
    const handleLogin = async () => {
        
        try {
            const response = await login(username, password);
            if (response.status === 'success') {
                alert(`歡迎, ${username}!`); // 成功訊息
                setIsLoggedIn(true); // 更新登入狀態
                setSavedUsername(username); // 更新顯示名稱
                navigate('/'); // 至首頁
            } else {
                // 帳號或密碼錯誤，或者伺服器錯誤
                alert(response.message || '發生錯誤，請稍後再試'); // 提示 API 回應的錯誤訊息
            }
        } catch (error) {
            // 處理網路問題或伺服器無回應等情況
            alert(error.message || '登入失敗，請稍後再試');
        }
    };

    //登出
    const handleLogout = async () => {
        try {
            await logout(); // 呼叫登出 API
            setIsLoggedIn(false); // 更新登入狀態
            setSavedUsername(''); // 清空顯示名稱
            navigate('/Login'); // 導向登入頁
        } catch (error) {
            alert(error.message || '登出失敗，請稍後再試');
        }
    };

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