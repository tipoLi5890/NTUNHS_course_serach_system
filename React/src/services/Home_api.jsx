import axios from 'axios';

// 定義 API 基底 URL
const API_BASE_URL = 'http://localhost/api/courses.php';
/**
 * 遞迴過濾查詢參數，移除空值或無效條件
 * @param {object} params - 原始查詢參數
 * @returns {object} 過濾後的查詢參數
 */
export const filterParams = (params) => {
    if (!params || typeof params !== 'object') return {}; // 檢查參數是否有效
    const cleanParams = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            cleanParams[key] = typeof value === 'object' && !Array.isArray(value)
                ? filterParams(value) // 遞迴過濾物件值
                : value; // 保留非空值
        }
    });

    return cleanParams; // 返回過濾後的參數
};

/**
 * 通用查詢函式
 * @param {object} data - 傳送的資料
 * @returns {Promise<object>} - 查詢結果
 */
export const fetchResults = async (data) => {
    try {
        console.log('發送的請求資料：', data);
        const response = await axios.post(
            '/api/courses.php',
            { data }, // 請求的主體，包含帳號和密碼
            { withCredentials: true } // 設置 withCredentials 為 true，以便攜帶 Cookie
        );
        console.log('回應資料：', response.data);
        return response.data; // 返回回應資料
    } catch (error) {
        console.error('API 請求失敗：', error.response || error.message);
        throw new Error('伺服器回應失敗');
    }
};


// 封裝具體查詢函式
/**
 * 一般搜尋課程
 * @param {string} searchTerm - 搜尋關鍵字
 * @param {boolean} isFuzzySearch - 是否進行模糊搜尋
 * @returns {Promise<object>} - 查詢結果
 */
export const searchCourses = (searchTerm) => {
    // 發送 API 請求
    return fetchResults({
        action: 'search',
        searchTerm: searchTerm.searchTerm,
        isFuzzySearch: Boolean(searchTerm.isFuzzySearch),
    });
};// 用於處理一般表單提交

/**
 * 根據查詢類型獲取特定資料
 * @param {string} queryType - 查詢類型
 * @param {object} userInfo - 使用者資訊
 * @returns {Promise<object>} - 查詢結果
 */
export const queryByType = (queryType) => {

    const requestData = {
        action: 'query',
        queryType: queryType.queryType,
        userID: queryType.userID
    };
    return fetchResults(
        filterParams(requestData));
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
    });

    return fetchResults(finalParams);
}; //複合式查詢