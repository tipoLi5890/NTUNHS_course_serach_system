import axios from 'axios';

// 定義 API 基底 URL
const API_URLS = {
    keywordSearch: '/api/courses_search_keyword.php', // 關鍵字搜尋 (課程)
    studentSearch: '/api/admin.php', // 關鍵字搜尋 (學生)
    queryByRequired: '/api/courses_search_required.php', //當期預排
    queryByElective: '/api/courses_search_elective.php', //科系選修
    complexSearch: '/api/courses_search_complex.php', //複合查詢
}

/**
 * 遞迴過濾查詢參數，移除空值或無效條件
 * @param {object} params - 原始查詢參數
 * @returns {object} 過濾後的查詢參數
 */
export const filterParams = (params) => {
    if (!params || typeof params !== 'object') return {}; // 檢查參數是否有效
    const cleanParams = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            cleanParams[key] = typeof value === 'object' && !Array.isArray(value)
                ? filterParams(value) // 遞迴過濾物件值
                : value; // 保留非空值
        }
    });

    return cleanParams; // 返回過濾後的參數
};

/**
 * 通用查詢函式
 * @param {string} url - API 端點
 * @param {object} data - 傳送的資料
 * @returns {Promise<object>} - 查詢結果
 */
export const fetchResults = async (url, data) => {
    try {
        console.log('發送的請求資料：', data);
        const response = await axios.post(
             url , // URL 字串
             data , // 傳送的資料物件
            { withCredentials: true } // 攜帶 Cookie
        ); // 發送 POST 請求
        console.log('回應資料：', response.data);
        return response.data; // 返回回應資料
    } catch (error) {
        console.error('API 請求失敗：', error.response || error.message);
        throw new Error('伺服器回應失敗');
    }
};


/** 封裝具體查詢函式
 * 一般關鍵字搜尋課程
 * @param {object} searchTerm - 搜尋參數物件
 * @param {string} searchTerm.searchTerm  - 搜尋關鍵字
 * @param {boolean} isFuzzySearch - 是否進行模糊搜尋
 * @returns {Promise<object>} - 查詢結果
 */
export const searchCourses = (searchTerm) => {
    // 發送 API 請求
    return fetchResults(API_URLS.keywordSearch, {
        action: 'search',
        searchTerm: searchTerm.searchTerm,
        isFuzzySearch: Boolean(searchTerm.isFuzzySearch),
    });
};// 用於處理一般表單提交

/** 封裝具體查詢函式
 * 一般關鍵字搜尋學生
 * @param {object} searchTerm - 搜尋參數物件
 * @param {string} searchTerm.searchTerm  - 搜尋關鍵字
 * @param {boolean} isFuzzySearch - 是否進行模糊搜尋
 * @returns {Promise<object>} - 查詢結果
 */
export const searchStudent = (searchTerm) => {
    // 發送 API 請求
    return fetchResults(API_URLS.studentSearch, {
        action: 'search-student',
        searchTerm: searchTerm.searchTerm,
        isFuzzySearch: Boolean(searchTerm.isFuzzySearch),
    });
};


/**
 * 根據查詢類型獲取特定資料
 * @param {object} queryType - 類別參數物件
 * @param {string} queryType.queryType - 查詢類型 (destinedCourse 或 selectiveCourse)
 * @param {string} queryType.userID - 使用者 ID
 * @returns {Promise<object>} - 查詢結果
 */
export const queryByType = (queryType) => {
    // 動態選擇 URL
    const targetURL = queryType.queryType === "destinedCourse"
     ? API_URLS.queryByRequired 
     : API_URLS.queryByElective;

    // 過濾參數
    const requestData = filterParams({
        action: 'query',
        queryType: queryType.queryType,
        userID: queryType.userID,
    });

    return fetchResults(targetURL, requestData);
}; // 用於處理單一按鈕提交

/**
 * 複合查詢
 * @param {object} queryParams - 複合查詢參數
 * @returns {Promise<object>} - 查詢結果
 */
export const complexSearch = (queryParams) => {
    if (!queryParams || Object.keys(queryParams).length === 0) {
        throw new Error('複合查詢參數無效');
    }

    const finalParams = filterParams({
        action: 'complex-search',
        term: queryParams.term,
        teacher: queryParams.teacher,
        system: queryParams.system,
        room: queryParams.room,
        period: queryParams.period,
        grade: queryParams.grade,
        department: queryParams.department,
        day: queryParams.day,
        courseType: queryParams.courseType,
        course: queryParams.course,
        class: queryParams.class,
        category: queryParams.category,
        capacity: queryParams.capacity,
        courseID: queryParams.cpurseID,
        id: queryParams.id
    });

    return fetchResults(API_URLS.complexSearch, finalParams);
}; //複合式查詢