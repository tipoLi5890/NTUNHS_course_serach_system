import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import hostView from '../../assets/home/NTUNHS.png';
import { filterParams, searchCourses, queryByType, complexSearch } from '../../services/Home_api';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFuzzySearch, setIsFuzzySearch] = useState(false); // 新增模糊搜尋的狀態
    const [queryType, setQueryType] = useState(''); // 查詢類型
    const [userInfo, setUserInfo] = useState({}); // 使用者資訊
    const navigate = useNavigate();

    // 檢查 localStorage 是否有登入資訊
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const savedUsername = localStorage.getItem('savedUsername');
        // setIsLoggedIn(isLoggedIn);
        // setSavedUsername(savedUsername || '');
    }, []);


    /**
       * 通用查詢函式
       * @param {Function} apiCall - API 呼叫函式
       * @param {object} params - 查詢參數
    */
    // 處理點擊事件
    const handleQuery = async (apiCall, params, queryType, isComplexSearch = false) => {
        // 有效的 queryType 列表
        const validQueryTypes = ["destinedCourse", "selectiveCourse", "searchedRecord"];
        if (queryType) {
            params.queryType = queryType; // 確保 queryType 正確設置
        }
        // if (!loggedIn && validQueryTypes.includes(queryType)) {
        //     alert('此功能僅提供已登入的使用者使用');
        //     return;
        // }
        if (
            !searchTerm && !validQueryTypes.includes(queryType) && !isComplexSearch) {
            alert('查詢內容不可為空');
            return;
        }
        try {
            console.log('傳遞參數:', params); // 確認參數內容
            const results = await apiCall(params);
            console.log('查詢結果：', results); // 確認回傳的資料是否正確
            const serializableParams = JSON.parse(JSON.stringify(params)); // 避免不可序列化物件的錯誤
            const cleanedResults = JSON.parse(JSON.stringify(results));
            navigate('/Courses', { state: { queryParams: serializableParams, results: cleanedResults } });
        } catch (error) {
            console.error('API 查詢失敗：', error.response || error.message); // 增加錯誤日誌
            alert(`查詢失敗，請稍後再試。\n錯誤訊息：${error.message}`);
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
                        handleQuery(searchCourses, filterParams({ searchTerm, isFuzzySearch }));
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
                    {/* 單一按鈕提交 */}
                    {[
                        { queryType: 'destinedCourse', label: '當期預排' },
                        { queryType: 'selectiveCourse', label: '科系選修' },
                        { queryType: 'searchedRecord', label: '歷史搜尋' },
                    ].map(({ queryType, label }) => (
                        <form id="queryForm" key={queryType}>
                            <div
                                className="query-button"
                                onClick={() => handleQuery(queryByType, { queryType, userInfo }, queryType)}
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
                    const formData = new FormData(e.target);

                    // 定義哪些字段是多選的
                    const multiSelectFields = ["grade", "department", "courseType", "day", "period", "system"];

                    // 將表單資料轉換為物件
                    const queryParams = {};
                    for (const [key, value] of formData.entries()) {
                        // 如果是多選字段，將其值存為陣列
                        if (multiSelectFields.includes(key)) {
                            if (!queryParams[key]) {
                                queryParams[key] = [];
                            }
                            queryParams[key].push(value);
                        } else {
                            queryParams[key] = value;
                        }
                    }

                    // 檢查學期是否為單選（直接保留）
                    if (!queryParams.term || queryParams.term.length === 0) {
                        alert('請選擇至少一個學期');
                        return;
                    }
                    handleQuery(complexSearch, queryParams, true);
                }}>
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
                    <button type="submit">
                        送出查詢
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
