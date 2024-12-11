import axios from 'axios';

const API_BASE_URL = 'https://06b3b194-3a22-44c9-85c7-9a77138d0e79.mock.pstmn.io';

/**
 * 取得使用者的歷史課程
 * @param {string} userID - 使用者ID
 * @returns {Promise<Array>} 歷史課程的清單
 */
export const getHistoryCourses = async (userID) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/history`, {
            params: {
                action: 'get-history-courses',
                userID: userID,
            },
        });
        console.log(response.data.history);
        return response.data.history; // 確認回傳的資料格式
    } catch (error) {
        console.error('Error fetching history courses:', error.response || error.message);
        throw new Error('取得歷史課程失敗');
    }
};

/**
 * 取得學生的評論記錄
 * @param {string} userID - 用戶ID
 * @returns {Promise<Object[]>} 返回記錄數據
 */
export const getUserRecords = async (userID) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/record`, {
            params: {
                action: 'get-user-record',
                userID: userID,
            },
        });
        console.log(response.data.record);
        return response.data.record; // 假設後端回傳格式包含 `record` 欄位
    } catch (error) {
        console.error('Error fetching user records:', error.response || error.message);
        throw new Error(error.response?.data?.error || '無法取得歷史評論紀錄');
    }
};

/**
 * 學生提交評價 
 * @param {string} id - 課程 ID
 * @param {string} userID - 使用者 ID
 * @param {string} commentInput - 使用者輸入的評論
 * @returns {Promise<Object>} 返回更新後的記錄數據
 */
export const commentData = async (id, userID, commentInput) => {
    try {
        // 發送 POST 請求
        const response = await axios.post(`${API_BASE_URL}/submitComment`, {
            id: id,
            userID: userID,
            comment: commentInput,
        });
        console.log('評論提交成功，回傳資料:', response.data.updatedRecord);
        return response.data.updatedRecord; // 假設後端返回 updatedRecord 為更新後的紀錄
    } catch (error) {
        console.error('提交評論時發生錯誤:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || '提交評論失敗');
    }
};

/**
 * 取得某課程的評論內容
 * @param {string} id - 課程ID
 * @returns {Promise<Object[]>} 返回記錄數據
 */
export const getRecords = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/courseRecord`, {
            params: {
                action: 'get-course-record',
                id: id,
            },
        });
        console.log(response.data.courseRecord);
        return response.data.courseRecord; // 假設後端回傳格式包含 `courseRecord` 欄位
    } catch (error) {
        console.error('Error fetching user records:', error.response || error.message);
        throw new Error(error.response?.data?.error || '無法取得課程評論');
    }
};