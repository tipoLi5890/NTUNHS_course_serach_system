import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/styles.css';

const Record = () => {
    const [menuOpen, setMenuOpen] = useState(false); // 控制選單展開/收縮
    const navigate = useNavigate(); // 使用 useNavigate 來進行路由跳轉

    //登入
    const isLoggedIn = window.Cookies.get('isLoggedIn');
    const savedUsername = window.Cookies.get('username');

    //登出
    const handleLogout = () => {
        // 清除登入 Cookies
        Cookies.remove('isLoggedIn');
        Cookies.remove('username');
        // 重定向到首頁
        navigate('/');
        // 確保清理狀態立即反映
        window.location.reload(); // 強制重新載入頁面，確保 UI 更新
    };

    return (
        <div id="returnPlace">
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
            
            <div className='main'>
                <h2>我的課程紀錄</h2>
            </div>
            
            {/* 頁尾 */}
            <footer></footer>
            
        </div>
    );
};

export default Record;
