import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import hostView from '../../assets/home/NTUNHS.png';
import { searchCourses, queryByType, complexSearch, filterParams } from '../../services/Home_api';
import { useAuth } from '../../hook/AuthProvider.jsx';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFuzzySearch, setIsFuzzySearch] = useState(false); // 新增模糊搜尋的狀態
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, userInfo } = useAuth(); // 從 AuthProvider 獲取登入狀態與使用者資訊

    /**
     * 處理通用查詢的主函式
     * @param {Function} apiCall - API 呼叫函式
     * @param {object} params - 查詢參數
     * @param {string} queryType - 查詢類型
     * @param {boolean} isComplexSearch - 是否為複合查詢
     */
    // 處理點擊事件
    const handleQuery = async (apiCall, params, queryType, isComplexSearch = false) => {
        const validQueryTypes = ["destinedCourse", "selectiveCourse", "searchedRecord"];

        // 需要驗證的查詢類型且未登入
        if (!isAuthenticated && validQueryTypes.includes(queryType)) {
            alert('此功能僅提供已登入的使用者使用');
            return;
        }
        // 查詢內容為空且不屬於指定類型
        if (!searchTerm && !validQueryTypes.includes(queryType) && !isComplexSearch) {
            alert('查詢內容不可為空');
            return;
        }

        const filteredParams = filterParams({
            ...params,
            searchTerm,
            isFuzzySearch,
            userID: userInfo?.userID,
        });

        try {
            setIsLoading(true);
            console.log('傳遞參數:', filteredParams); // 確認參數內容
            const results = await apiCall(filteredParams);
            console.log('查詢結果：', results); // 確認回傳的資料是否正確
            navigate('/Courses', { state: { queryParams: filteredParams, results, isComplexSearch } });
            setSearchTerm(''); // 確保搜尋結束後才清空
        } catch (error) {
            console.error('API 查詢失敗：', error.response || error.message); // 增加錯誤日誌
            alert(`查詢失敗，請稍後再試。\n錯誤訊息：${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="returnPlace">
            {/* 頁首 */}
            <Header />

            {/* 搜尋 */}
            <div id="face">
                <div id="face-left">
                    <img src={hostView} alt="背景" className="hostView" />
                    {/* 搜尋欄 */}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleQuery(searchCourses, {}, 'searchCourses');
                    }} className="search-form">
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
                <div id="face-right">
                    {/* 查詢類型按鈕 */}
                    {[{ type: 'destinedCourse', label: '當期預排' },
                    { type: 'selectiveCourse', label: '科系選修' },
                    { type: 'searchedRecord', label: '歷史搜尋' }].map(({ type, label }) => (
                        <form id="queryForm" key={type}>
                            <div
                                className="query-button"
                                onClick={() => handleQuery(queryByType, { queryType: type }, type)}
                                role="button"
                                tabIndex={0}
                            >
                                {label}
                            </div>
                        </form>
                    ))}
                </div>
            </div>

            {/* 複合查詢 */}
            <div>複合查詢</div>
            <div>▼</div>
            <br />
            <br />
            <form id="complexSearch"
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target); // 獲取表單數據
                    const multiSelectFields = ["grade", "department", "courseType", "day", "period", "system"]; // 定義多選欄位
                    const queryParams = {}; // 初始化查詢參數
                    // 遍歷表單數據
                    formData.forEach((value, key) => {
                        // 如果是多選欄位，將值存為陣列
                        if (multiSelectFields.includes(key)) {
                            queryParams[key] = queryParams[key] || [];
                            queryParams[key].push(value);
                        } else {
                            queryParams[key] = value; // 單選欄位或其他輸入值
                        }
                    });

                    // 確保多選欄位至少為空陣列
                    multiSelectFields.forEach((field) => {
                        if (!queryParams[field]) queryParams[field] = [];
                    });

                    // 確認是否使用複合查詢
                    const isComplexSearch = Object.values(queryParams).some((value) =>
                        Array.isArray(value) ? value.length > 0 : value
                    );

                    // 檢查學期是否為單選（直接保留）
                    if (!isComplexSearch || !queryParams.term) {
                        alert('請選擇至少一個學期');
                        return;
                    }
                    handleQuery(complexSearch, queryParams, "complexSearch", true);
                }}>
                <div className="flex-label-container">
                    <span className="label-title">學期：</span>
                    <div className="checkbox-group">
                        {["1142", "1141", "1132", "1131", "1122", "1121", "1112", "1111", "1102", "1101"].map(term => (
                            <label key={term} className="custom-checkbox">
                                <input type="radio" name="term" value={term} />
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
                    <input className="testFactor" type="text" name="teacher" />
                </label>
                <hr />
                <label>
                    課程：
                    <input className="testFactor" type="text" name="course" />
                </label>
                <hr />
                <label>
                    班級：
                    <input className="testFactor" type="text" name="class" />
                </label>
                <hr />
                <label>
                    教室：
                    <input className="testFactor" type="text" name="room" />
                </label>
                <hr />
                <label>
                    人數：
                    <input className="testFactor" type="text" name="capacity" />
                </label>
                <br /><br />
                <div id="submit-container">
                    <button type="submit" disabled={isLoading}>
                    {isLoading ? '查詢中...' : '送出查詢'}
                    </button>
                </div>
            </form>

            <br /><br />

            {/* 頁尾 */}
            <Footer />
        </div>
    );
};
export default Home;
