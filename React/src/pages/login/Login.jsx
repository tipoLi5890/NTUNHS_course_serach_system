import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import backgroundImage from '../../assets/login/background.jpg';

const Login = () => {
    //帳號密碼
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    //預設帳號密碼
    const correctUsername = 'admin';
    const correctPassword = '123';

    //登入
    const handleLogin = () => {
        if (username === correctUsername && password === correctPassword) {
            alert('登入成功！');
            window.Cookies.set('isLoggedIn', 'true'); // 設定登入狀態
            window.Cookies.set('username', username); // 儲存使用者名稱
            navigate('/');
        } else {
            alert('帳號或密碼錯誤');
        }
    };

    //登出
    const handleLogout = () => {
        window.Cookies.remove('isLoggedIn');
        window.Cookies.remove('username');
        navigate('/Login'); // 可跳轉至登入頁面
    };

    // 使用全域 Cookies
    const isLoggedIn = window.Cookies.get('isLoggedIn'); 
    const savedUsername = window.Cookies.get('username');

    //回傳畫面
    return (
        <div id="returnPlace">
            {/* 背景圖片容器 */}
            <div className="background-container">
                <img src={backgroundImage}  alt="背景" className="background-image"/>
            </div>

            {/* 頁首 */}
            <Header/>
            
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
            <Footer/>
        </div>
    );
};

export default Login;