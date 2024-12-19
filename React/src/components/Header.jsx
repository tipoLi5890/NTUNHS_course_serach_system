import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/AuthProvider.jsx';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false); // 控制選單展開/收縮
    const navigate = useNavigate();

    // 從 useAuth Hook 中解構出認證狀態和相關方法
    const { isAuthenticated, userInfo, logoutUser } = useAuth();

    //登出
    const handleLogout = async () => {
        // 呼叫 logoutUser 方法進行登出
        await logoutUser();
        alert("登出成功！");
        navigate('/');
    };

    // 動態選單項目
    const menuItems = [
        { label: '系統首頁', path: '/' },
        { label: '推薦課程', path: '/Recommendation' },
        { label: '課程規劃', path: '/Planning' },
        { label: '歷史修課', path: '/Record' },
        isAuthenticated
            ? { label: `登出 (${userInfo?.username})`, onClick: handleLogout }
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