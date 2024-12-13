import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import backgroundImage from '../../assets/login/background.jpg';
import { useAuth } from '../../hook/AuthProvider.jsx'; // 引入自訂的 useAuth Hook

/**
 * Login 組件
 * 負責處理使用者的登入與登出功能，並根據使用者的認證狀態顯示不同的界面。
 */
const Login = () => {
    // 使用 useState Hook 來管理使用者輸入的帳號和密碼
    const [username, setUsername] = useState(''); // 儲存使用者輸入的帳號
    const [password, setPassword] = useState(''); // 儲存使用者輸入的密碼

    // 從 useAuth Hook 中解構出認證狀態和相關方法
    const { isAuthenticated, userInfo, loginUser, logoutUser } = useAuth();
    
    // 使用 useNavigate Hook 來進行路由導航
    const navigate = useNavigate();

    /**
     * 處理使用者登入
     * 當使用者點擊登入按鈕時，呼叫 loginUser 方法進行登入操作。
     * 如果登入成功，顯示歡迎訊息並導向首頁；否則，顯示錯誤訊息。
     */
    const handleLogin = async () => {
        // 呼叫 loginUser 方法，傳入使用者輸入的帳號和密碼
        const success = await loginUser(username, password);
        
        if (success) {
            // 登入成功，顯示歡迎訊息
            alert(`歡迎, ${username}!`);
            navigate('/');
        } else {
            // 登入失敗，顯示錯誤訊息
            alert('帳號或密碼錯誤，請稍後再試');
        }
    };

    /**
     * 處理使用者登出
     * 當使用者點擊登出按鈕時，呼叫 logoutUser 方法進行登出操作。
     * 登出後，導向登入頁面。
     */
    const handleLogout = async () => {
        // 呼叫 logoutUser 方法進行登出
        await logoutUser();
        // 導向登入頁面
        navigate('/Login');
    };

    // 回傳組件的 JSX 結構
    return (
        <div id="returnPlace">
            {/* 背景圖片容器 */}
            <div className="background-container">
                {/* 顯示背景圖片 */}
                <img src={backgroundImage} alt="背景" className="background-image" />
            </div>

            {/* 頁首組件 */}
            <Header />

            {/* 登入區域 */}
            <div className="login-container">
                {isAuthenticated ? ( // 根據認證狀態顯示不同的內容
                    // 如果使用者已登入，顯示使用者名稱和登出按鈕
                    <div>
                        {/* 顯示使用者名稱 */}
                        <h3>{userInfo?.username}</h3>
                        {/* 登出按鈕 */}
                        <button onClick={handleLogout}>登出</button>
                    </div>
                ) : (
                    // 如果使用者未登入，顯示登入表單
                    <div className="login-box">
                        {/* 帳號輸入區塊 */}
                        <div className="input-group">
                            <label htmlFor="username" className="input-label">帳號</label>
                            <input
                                id="username" // 對應 label 的 htmlFor
                                type="text" // 輸入類型為文字
                                value={username} // 綁定 username 狀態
                                onChange={(e) => setUsername(e.target.value)} // 當輸入改變時更新 username 狀態
                            />
                        </div>

                        {/* 密碼輸入區塊 */}
                        <div className="input-group">
                            <label htmlFor="password" className="input-label">密碼</label>
                            <input
                                id="password" // 對應 label 的 htmlFor
                                type="password" // 輸入類型為密碼，隱藏輸入內容
                                value={password} // 綁定 password 狀態
                                onChange={(e) => setPassword(e.target.value)} // 當輸入改變時更新 password 狀態
                            />
                        </div>

                        {/* 登入按鈕 */}
                        <button id="start" onClick={handleLogin}>登入</button>
                        {/* 忘記密碼連結 */}
                        <a href="https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Main/Index_student.aspx">忘記密碼</a>
                    </div>
                )}
            </div>

            {/* 頁尾組件 */}
            <Footer />
        </div>
    );
};

export default Login;
