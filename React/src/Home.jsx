import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/home.css';
import hostView from './assets/home/NTUNHS.png';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [menuOpen, setMenuOpen] = useState(false); // 控制選單展開/收縮
    const navigate = useNavigate();

    // 用於處理一般表單提交
    const [isFuzzySearch, setIsFuzzySearch] = useState(false); // 新增模糊搜尋的狀態
    const handleSearch = (e) => {
        e.preventDefault();
        const form = document.createElement("form");
        form.action = "/test";
        form.method = "get";

        // 隱藏 input 提交來源
        const sourceInput = document.createElement("input");
        sourceInput.type = "hidden";
        sourceInput.name = "source";
        sourceInput.value = "search-form";
        form.appendChild(sourceInput);

        // 搜尋字串
        const searchInput = document.createElement("input");
        searchInput.type = "hidden";
        searchInput.name = "searchTerm";
        searchInput.value = searchTerm.trim();
        form.appendChild(searchInput);

        // 模糊搜尋狀態
        const fuzzySearchInput = document.createElement("input");
        fuzzySearchInput.type = "hidden";
        fuzzySearchInput.name = "isFuzzySearch";
        fuzzySearchInput.value = isFuzzySearch ? "true" : "false";
        form.appendChild(fuzzySearchInput);

        document.body.appendChild(form);
        form.submit();
    };

    // 用於處理單一按鈕提交
    const handleQuerySubmit = (e) => {
        e.preventDefault();
        const value = e.currentTarget.getAttribute('data-value');

        const form = document.createElement("form");
        form.action = "/test";
        form.method = "get";

        // 隱藏 input 區分來源
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = "source";
        hiddenInput.value = "query-button";
        form.appendChild(hiddenInput);

        // 按鈕值
        const queryInput = document.createElement("input");
        queryInput.type = "hidden";
        queryInput.name = "queryType";
        queryInput.value = value;
        form.appendChild(queryInput);

        document.body.appendChild(form);
        form.submit();
    };

    //複合式查詢
    const handleComplexSearchSubmit = (e) => {
        e.preventDefault();
    
        const form = document.getElementById("complexSearch");
        const selectedConditions = [];
    
        // 收集所有勾選條件
        form.querySelectorAll("input[type='checkbox']:checked").forEach((input) => {
            selectedConditions.push(input.value.trim());
        });
    
        // 收集其他輸入框與選擇框的值
        form.querySelectorAll("input[type='text'], select").forEach((input) => {
            if (input.value.trim() !== "") {
                selectedConditions.push(`${input.name || input.placeholder}: ${input.value.trim()}`);
            }
        });
    
        // URLSearchParams 設置
        const params = new URLSearchParams({
            source: "complex-search",
            conditions: selectedConditions.join(", "),
        });
    
        // 送出查詢
        window.location.href = `/test?${params.toString()}`;
    };
    


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
                                        <span onClick={() => {
                                                if (item.path) { navigate(item.path);} 
                                                else if (item.onClick) {item.onClick();} // 正確綁定方法
                                                setMenuOpen(false);}}
                                        >
                                            {item.label}
                                        </span>
                                        {index < array.length - 1 && (<hr/>)}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </div>
            </header>

            {/* 搜尋 */}
            <div id= "face">
                <div id= "face-left">
                    <img src={hostView}  alt="背景" className="hostView"/>
                    {/* 搜尋欄 */}
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-container">
                            <input
                                type="text"
                                placeholder="搜尋課程、教師、時間..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div id="search-mode">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isFuzzySearch}
                                    onChange={(e) => setIsFuzzySearch(e.target.checked)}
                                />模糊搜尋
                            </label>
                        </div>
                    </form>
                </div>
                <div id= "face-right">
                    {/* 單一按鈕提交 */}
                    <form id="queryForm">
                        <div 
                            className="query-button" 
                            data-value="destinedCourse"
                            onClick={(e) => handleQuerySubmit(e)}>
                            當期預排
                        </div>
                        <div 
                            className="query-button" 
                            data-value="selectiveCourse"
                            onClick={(e) => handleQuerySubmit(e)}>
                            科系選修
                        </div>
                        <div 
                            className="query-button" 
                            data-value="searchedRecord"
                            onClick={(e) => handleQuerySubmit(e)}>
                            歷史搜尋
                        </div>
                    </form>
                </div>
            </div>

            {/* 複合查詢 */}
            <div>複合查詢</div>
            <div>▼</div>
            <br/>
            <br/>
            <form id="complexSearch" action="/test" method="get" onSubmit={handleComplexSearchSubmit}>
                <div className="flex-label-container">
                    <span className="label-title">學期：</span>
                    <div className="checkbox-group">
                        {["1142", "1141", "1132", "1131", "1122", "1121", "1112", "1111", "1102", "1101"].map(term => (
                            <label key={term} className="custom-checkbox">
                                <input type="checkbox" name="term" value={term} />
                                <div><span>{term}</span></div>
                            </label>
                        ))}
                    </div>
                </div>
                <hr />
                <div className="flex-label-container">
                    <span className="label-title">學制：</span>
                    <div className="checkbox-group">
                        {["二技", "二技(三年)", "四技", "學士後多元專長", "碩士", "博士", "學士後學位學程", "學士後系"].map(system => (
                            <label key={system} className="custom-checkbox">
                                <input type="checkbox" name="system" value={system} />
                                <div><span>{system}</span></div>
                            </label>
                        ))}
                    </div>
                </div>
                <hr />
                <div className="flex-label-container">
                    <span className="label-title">系所：</span>
                    <div className="checkbox-group">
                        {["護理系", "高照系", "資管系", "健管系", "生諮系", "幼保系", "運保系"].map(department => (
                            <label key={department} className="custom-checkbox">
                                <input type="checkbox" name="department" value={department} />
                                <div><span>{department}</span></div>
                            </label>
                        ))}
                    </div>
                </div>
                <hr />
                <div className="flex-label-container">
                    <span className="label-title">年級：</span>
                    <div className="checkbox-group">
                        {["一", "二", "三", "四", "五", "六", "七"].map(grade => (
                            <label key={grade} className="custom-checkbox">
                                <input type="checkbox" name="grade" value={grade} />
                                <div><span>{grade}</span></div>
                            </label>
                        ))}
                    </div>
                </div>
                <hr />
                <div className="flex-label-container">
                    <span className="label-title">課別：</span>
                    <div className="checkbox-group">
                        {["通識必修", "通識選修", "系所必修", "系所選修"].map(courseType => (
                            <label key={courseType} className="custom-checkbox">
                                <input type="checkbox" name="courseType" value={courseType} />
                                <div><span>{courseType}</span></div>
                            </label>
                        ))}
                    </div>
                </div>
                <hr />
                <div className="flex-label-container">
                    <span className="label-title">星期：</span>
                    <div className="checkbox-group">
                        {["一", "二", "三", "四", "五", "六", "日"].map(day => (
                            <label key={day} className="custom-checkbox">
                                <input type="checkbox" name="day" value={day} />
                                <div><span>{day}</span></div>
                            </label>
                        ))}
                    </div>
                </div>
                <hr />
                <div className="flex-label-container">
                    <span className="label-title">節次：</span>
                    <div className="checkbox-group">
                        {["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四"].map(period => (
                            <label key={period} className="custom-checkbox">
                                <input type="checkbox" name="period" value={period} />
                                <div><span>{period}</span></div>
                            </label>
                        ))}
                    </div>
                </div>
                <hr />
                <label>
                    內容分類：
                    <select id="category" name="category">
                        {[
                            "",
                            "跨校",
                            "跨域課程",
                            "全英語授課",
                            "EMI全英語授課",
                            "同步遠距教學",
                            "非同步遠距教學",
                            "混合式遠距教學",
                            "遠距教學課程",
                            "遠距輔助課程"
                        ].map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </label>
                <hr />
                <label>
                    教師：
                    <input className="testFactor" type="text" name="teacher"/>
                </label>
                <hr />
                <label>
                    課程：
                    <input className="testFactor" type="text" name="course"/>
                </label>
                <hr />
                <label>
                    班級：
                    <input className="testFactor" type="text" name="class"/>
                </label>
                <hr />
                <label>
                    教室：
                    <input className="testFactor" type="text" name="room"/>
                </label>
                <hr />
                <label>
                    人數：
                    <input className="testFactor" type="text" name="capacity"/>
                </label>
                <br /><br />
                <div id="submit-container">
                    <button type="submit">
                        送出查詢
                    </button>
                </div>
            </form>

            <br /><br />

            {/* 頁尾 */}
            <footer></footer>
        </div>
    );
};
export default Home;
