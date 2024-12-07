import axios from 'axios';

// 定義 API 基底 URL
const API_BASE_URL = 'https://06b3b194-3a22-44c9-85c7-9a77138d0e79.mock.pstmn.io/home.php';

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
        const response = await axios.post(API_BASE_URL, data); // 發送 POST 請求
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
export const searchCourses = (searchTerm, isFuzzySearch) => {
    const sanitizedSearchTerm = typeof searchTerm === 'string' ? searchTerm.trim() : '';
    return fetchResults({
        action: 'search',
        searchTerm: sanitizedSearchTerm,
        isFuzzySearch: Boolean(isFuzzySearch),
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
        queryType,
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
        ...queryParams,
    });

    return fetchResults(finalParams);
}; //複合式查詢