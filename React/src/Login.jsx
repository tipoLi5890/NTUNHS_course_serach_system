import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Login.css';
import backgroundImage from './assets/login/background.jpg';

const Login = () => {
    //帳號密碼
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [menuOpen, setMenuOpen] = useState(false); // 控制選單展開/收縮
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
            <header>
                {/* 系統標題 */}
                <h2 id="header-title">國北護課程查詢系統</h2>
                {/* 選單 */}
                <div id="header-menu" onClick={() => setMenuOpen(!menuOpen)} /* 點擊切換選單開關 */>   
                    {/* 收起選單 */}
                    <div class="header-menu-line" id="header-menu-line1"></div>
                    <div class="header-menu-line" id="header-menu-line2"></div>
                    <div class="header-menu-line" id="header-menu-line3"></div>
                    {/* 展開的選單內容 */}
                    {menuOpen && (
                        <nav id="header-menu-nav">
                            {/* 關閉按鈕 */}
                            <div id="header-menu-nav-close" onClick={() => setMenuOpen(false)}>×</div>
                            {/* 選單列表 */}
                            <ul id="header-menu-nav-ul">
                                {[
                                    { label: '系統首頁', path: '/' },
                                    { label: '推薦課程', path: '/Recommendation' },
                                    { label: '課程規劃', path: '/Planning' },
                                    { label: '歷史修課', path: '/Record' },
                                    isLoggedIn
                                    ? { label: '登出', onClick: handleLogout } // 已登入顯示登出
                                    : { label: '學生登入', path: '/Login' }   // 未登入顯示登入
                                ].map((item, index, array) => (
                                    <li key={item.label}>
                                        <span
                                            onClick={() => {
                                                if (item.path) {
                                                    navigate(item.path);
                                                } else if (item.onClick) {
                                                    item.onClick(); // 正確綁定方法
                                                }
                                                setMenuOpen(false);
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                        {index < array.length - 1 && (
                                            <hr/>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </div>
            </header>
            
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

                        <button onClick={handleLogin}>登入</button>
                        <a>忘記密碼</a>
                    </div>
                )}
            </div>
            
            {/* 頁尾 */}
            <footer></footer>
        </div>
    );
};

export default Login;