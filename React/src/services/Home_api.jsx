import axios from 'axios';

// 定義 API 基底 URL
const API_BASE_URL = 'https://06b3b194-3a22-44c9-85c7-9a77138d0e79.mock.pstmn.io/home.php';

/**
 * 遞迴過濾查詢參數，移除空值或無效條件
 * @param {object} params - 原始查詢參數
 * @returns {object} 過濾後的查詢參數
 */
export const filterParams = (params) => {
    if (!params || typeof params !== 'object') return {};
    // 遞迴處理嵌套物件
    const cleanParams = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            // 如果值是物件，遞迴過濾
            cleanParams[key] = typeof value === 'object' && !Array.isArray(value)
                ? filterParams(value)
                : value;
        }
    });
    return cleanParams;
};

/**
 * 通用查詢函式
 * @param {object} data - 傳送的資料
 * @returns {Promise<object>} - 查詢結果
 */
export const fetchResults = async (data) => {
    try {
        console.log('發送的請求資料：', data);
        const response = await axios.post(API_BASE_URL, data);
        console.log('回應資料：', response.data);
        return response.data;
    } catch (error) {
        console.error('API 請求失敗：', error.response || error.message);
        throw new Error('伺服器回應失敗');
    }
};


// 封裝具體查詢函式
/**
 * 一般搜尋課程
 * @param {string} searchTerm - 搜尋字串
 * @param {boolean} isFuzzySearch - 是否進行模糊搜尋
 * @returns {Promise<object>} - 查詢結果
 */
export const searchCourses = (searchTerm, isFuzzySearch) => {
    const sanitizedSearchTerm = typeof searchTerm === 'string' ? searchTerm.trim() : '';
    return fetchResults({ action: 'search', searchTerm: sanitizedSearchTerm, isFuzzySearch });
}; // 用於處理一般表單提交

/**
 * 查詢特定類型資料
 * @param {string} queryType - 查詢類型
 * @returns {Promise<object>} - 查詢結果
 */

export const queryByType = (queryType, userInfo) => {
    if (!userInfo || typeof userInfo !== 'object') {
        console.error('userInfo 無效或未傳遞');
        throw new Error('userInfo 無效或未傳遞');
    }
    const queryTypeConfig = {
        destinedCourse: () => ({ class: userInfo.class, term: userInfo.term }),
        selectiveCourse: () => ({
            department: userInfo.department,
            grade: userInfo.grade,
            term: userInfo.term,
        }),
        searchedRecord: () => ({ userId: userInfo.userId }),
    };
    // 確保 API 支援這些類型
    
    if (!queryTypeConfig[queryType]) {
        throw new Error('無效的查詢類型');
    }

    const requestData = {
        action: 'query',
        queryType,
        ...queryTypeConfig[queryType](),
    };

    return fetchResults(filterParams(requestData));
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
        ...queryParams, // 保留其他查詢參數
    });

    return fetchResults(finalParams);
}; //複合式查詢