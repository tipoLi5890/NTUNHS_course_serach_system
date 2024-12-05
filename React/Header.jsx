import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/Login_api';
import { isLoggedIn as checkLoggedIn, getUsername as fetchUsername } from '../utils/Auth';
const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false); // 控制選單展開/收縮
    const [loggedIn, setLoggedIn] = useState(checkLoggedIn());
    const [username, setUsername] = useState(fetchUsername());
    const navigate = useNavigate();

    //登出
    const handleLogout = () => {
        logout(); // 使用 API 的登出函式
        setLoggedIn(false); // 更新登入狀態
        setUsername(null); // 清空使用者名稱
        navigate('/'); // 登出後返回首頁
    };

    const menuItems = [
        { label: '系統首頁', path: '/' },
        { label: '推薦課程', path: '/Recommendation' },
        { label: '課程規劃', path: '/Planning' },
        { label: '歷史修課', path: '/Record' },
        loggedIn
            ? { label: '登出', onClick: handleLogout }
            : { label: '學生登入', path: '/Login' }
    ];

    return (
        <header>
            {/* 系統標題 */}
            <h2 id="header-title">國北護課程查詢系統</h2>
            {/* 選單 */}
            <div id="header-menu" onClick={() => setMenuOpen(!menuOpen)} /* 點擊切換選單開關 */>
                {/* 收起選單 */}
                <div className="header-menu-line" id="header-menu-line1"></div>
                <div className="header-menu-line" id="header-menu-line2"></div>
                <div className="header-menu-line" id="header-menu-line3"></div>
                {/* 展開的選單內容 */}
                {menuOpen && (
                    <nav id="header-menu-nav">
                        {/* 關閉按鈕 */}
                        <div id="header-menu-nav-close" onClick={() => setMenuOpen(false)}>×</div>
                        {/* 選單列表 */}
                        <ul id="header-menu-nav-ul">
                        {menuItems.map((item, index, array) => (
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
                                    {index < array.length - 1 && (<hr />)}
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;