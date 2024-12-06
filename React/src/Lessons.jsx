import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
//import './styles/lessons.css';
import './styles/home.css';
import { filterParams, searchCourses, queryByType, complexSearch } from './api/Home_api'; // 匯入課程查詢 API
import { logout } from './api/Login_api';
import { isLoggedIn } from './utils/Auth';

const Lessons = () => {
    const [menuOpen, setMenuOpen] = useState(false); // 控制選單展開/收縮
    const [results, setResults] = useState([]);  // 儲存查詢結果
    const [loading, setLoading] = useState(true); // 載入狀態
    const [error, setError] = useState(null); // 錯誤狀態

    const location = useLocation();
    const navigate = useNavigate();

    // 從導航時傳遞的狀態中取得查詢條件
    const { searchTerm = '', isFuzzySearch = false, queryType = null, queryParams = {} } = location.state || {};

    // 當搜尋條件變更時，重新查詢
    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true); // 啟動載入狀態
                setError(null); // 重置錯誤狀態

                let data = [];
                if (searchTerm) {
                    console.log(`執行關鍵字查詢: ${searchTerm}, 模糊查詢: ${isFuzzySearch}`);
                    data = await searchCourses(searchTerm, isFuzzySearch);
                } else if (queryType) {
                    console.log(`執行類型查詢: ${queryType}`);
                    data = await queryByType(queryType);
                } else if (queryParams) {
                    console.log(`執行複合式查詢，條件:`, filterParams(queryParams));
                    data = await complexSearch(filterParams(queryParams));
                } else {
                    console.warn('無有效查詢條件，停止查詢');
                }

                setResults(data);
            } catch (err) {
                setError(`查詢失敗: ${err.message}`);
            } finally {
                setLoading(false); // 停止載入
            }
        };

        fetchResults();
    }, [searchTerm, isFuzzySearch, queryType, queryParams]);

    //登出
    const handleLogout = () => {
        logout(); // 使用 API 的登出函式
        navigate('/'); // 登出後返回首頁
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

            <h2>搜尋結果</h2>
            {loading ? (
                <p>正在載入資料...</p>
            ) : error ? (
                <p>{error}</p>
            ) : results && results.courses && results.courses.length > 0 ? (
                <ul>
                    {results.courses.map((course, index) => (
                        <li key={index}>
                            <strong>課程名稱:</strong> {course.courseName} <br />
                            <strong>授課老師:</strong> {course.instructor} <br />
                            <strong>學分數:</strong> {course.credits} <br />
                        </li>
                    ))}
                </ul>
            ) : !results.courses ? (
                <p>無法取得課程資料，請稍後再試。</p>
            ): (
                <p>沒有符合的結果。</p>
            )}

            {/* 頁尾 */}
            <footer></footer>
        </div>
    );
};
export default Lessons;
