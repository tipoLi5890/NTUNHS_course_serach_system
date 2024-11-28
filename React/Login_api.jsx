//Login_api.js
// 匯入 js-cookie 庫用於管理 Cookies
import Cookies from 'js-cookie';
import axios from 'axios';

/**
 * 登入 API 請求函式
 * @param {string} username - 使用者帳號
 * @param {string} password - 使用者密碼
 * @returns {Promise<Object>} 回應的資料，包含是否成功及訊息
 */
export const login = async (username, password) => {
    try {
        const response = await axios.post(
            'http://localhost/api/login.php',
            { username, password },
        );

        // 檢查是否有 success 和 message 欄位，若缺少則拋出錯誤
        if (response.data && typeof response.data.success === 'boolean' && typeof response.data.message === 'string') {
            return response.data; // 回傳 API 回應
        } else {
            throw new Error('伺服器回應格式不正確');
        }
    } catch (error) {
        // 錯誤處理：區分網路錯誤與後端錯誤
        if (error.response) {
            // 後端有回應但狀態碼非 2xx，例如 400 或 500
            console.error('後端錯誤:', error.response.data);
            throw new Error(error.response.data.message || '伺服器錯誤');
        } else if (error.request) {
            // 請求已發出但未收到回應
            console.error('網路錯誤:', error.request);
            throw new Error('無法連線至伺服器，請檢查您的網路');
        } else {
            // 其他錯誤（例如程式碼問題）
            console.error('錯誤:', error.message);
            throw new Error('發生未知錯誤');
        }
    }
};

/**
 * 登出函式
 */
export const logout = () => {
    Cookies.remove('isLoggedIn'); // 移除登入狀態
    Cookies.remove('username'); // 移除使用者名稱
};

//---------------------------------------------------------------------------------
//加入API的Login.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './styles/Login.css';
// import backgroundImage from './assets/login/background.jpg';
// import { login, logout } from './api/Login_api';
// import Cookies from 'js-cookie';

// const Login = () => {
//     //帳號密碼
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [menuOpen, setMenuOpen] = useState(false); // 控制選單展開/收縮
//     const navigate = useNavigate();

//     //預設帳號密碼
//     //const correctUsername = 'admin';
//     //const correctPassword = '123';

//     //登入
//     const handleLogin = async () => {
//         try {
//             const response = await login(username, password);
//             if (response.success) {
//                 alert(response.message); // 成功訊息，如 "登入成功"

//                 // 設置 Cookies 紀錄登入狀態與使用者名稱
//                 Cookies.set('isLoggedIn', true, { expires: 1 }); // 設置有效期 1 天
//                 Cookies.set('username', username, { expires: 1 });

//                 navigate('/'); // 導航至首頁
//             } else {
//                 // 帳號或密碼錯誤，或者伺服器錯誤
//                 alert(response.message || '發生未知錯誤'); // 提示 API 回應的錯誤訊息
//             }
//         } catch (error) {
//             // 處理網路問題或伺服器無回應等情況
//             alert(error.message || '無法連線至伺服器，請稍後再試');
//         }
//     };

//     //登出
//     const handleLogout = () => {
//         logout();
//         navigate('/Login'); // 登出後導航至登入頁面
//     };

//     // 使用全域 Cookies
//     const isLoggedIn = Cookies.get('isLoggedIn');
//     const savedUsername = Cookies.get('username');

//     //回傳畫面
//     return (
//         <div id="returnPlace">
//             {/* 背景圖片容器 */}
//             <div className="background-container">
//                 <img src={backgroundImage} alt="背景" className="background-image" />
//             </div>

//             {/* 頁首 */}
//             <header>
//                 {/* 系統標題 */}
//                 <h2 id="header-title">國北護課程查詢系統</h2>
//                 {/* 選單 */}
//                 <div id="header-menu" onClick={() => setMenuOpen(!menuOpen)} /* 點擊切換選單開關 */>
//                     {/* 收起選單 */}
//                     <div class="header-menu-line" id="header-menu-line1"></div>
//                     <div class="header-menu-line" id="header-menu-line2"></div>
//                     <div class="header-menu-line" id="header-menu-line3"></div>
//                     {/* 展開的選單內容 */}
//                     {menuOpen && (
//                         <nav id="header-menu-nav">
//                             {/* 關閉按鈕 */}
//                             <div id="header-menu-nav-close" onClick={() => setMenuOpen(false)}>×</div>
//                             {/* 選單列表 */}
//                             <ul id="header-menu-nav-ul">
//                                 {[
//                                     { label: '系統首頁', path: '/' },
//                                     { label: '推薦課程', path: '/Recommendation' },
//                                     { label: '課程規劃', path: '/Planning' },
//                                     { label: '歷史修課', path: '/Record' },
//                                     isLoggedIn
//                                         ? { label: '登出', onClick: handleLogout } // 已登入顯示登出
//                                         : { label: '學生登入', path: '/Login' }   // 未登入顯示登入
//                                 ].map((item, index, array) => (
//                                     <li key={item.label}>
//                                         <span
//                                             onClick={() => {
//                                                 if (item.path) {
//                                                     navigate(item.path);
//                                                 } else if (item.onClick) {
//                                                     item.onClick(); // 正確綁定方法
//                                                 }
//                                                 setMenuOpen(false);
//                                             }}
//                                         >
//                                             {item.label}
//                                         </span>
//                                         {index < array.length - 1 && (
//                                             <hr />
//                                         )}
//                                     </li>
//                                 ))}
//                             </ul>
//                         </nav>
//                     )}
//                 </div>
//             </header>

//             {/* 登入 */}
//             <div className="login-container">
//                 {isLoggedIn ? (
//                     <div>
//                         <h3>{savedUsername}</h3>
//                         <button onClick={handleLogout}>登出</button>
//                     </div>
//                 ) : (
//                     <div className="login-box">
//                         <div className="input-group">
//                             <label htmlFor="username" className="input-label">帳號</label>
//                             <input
//                                 id="username"
//                                 type="text"
//                                 value={username}
//                                 onChange={(e) => setUsername(e.target.value)}
//                             />
//                         </div>

//                         <div className="input-group">
//                             <label htmlFor="password" className="input-label">密碼</label>
//                             <input
//                                 id="password"
//                                 type="password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                             />
//                         </div>

//                         <button onClick={handleLogin}>登入</button>
//                         <a>忘記密碼</a>
//                     </div>
//                 )}
//             </div>

//             {/* 頁尾 */}
//             <footer></footer>
//         </div>
//     );
// };

// export default Login;