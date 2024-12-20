import axios from 'axios';

const API_BASE_URL = 'http://localhost/api/record.php';

/**
 * 取得使用者的歷史課程
 * @returns {Promise<Array>} 歷史課程的清單
 */
export const getHistoryCourses = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}`, {
            action: 'get-history-courses',
        },{ withCredentials: true });
        console.log(response.data.history);
        return response.data.history; // 確認回傳的資料格式
    } catch (error) {
        console.error('Error fetching history courses:', error.response || error.message);
        throw new Error('取得歷史課程失敗');
    }
};

/**
 * 取得學生的評論記錄
 * @returns {Promise<Object[]>} 返回記錄數據
 */
export const getUserRecords = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}`, {
            action: 'get-user-record',
        },{ withCredentials: true });
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
 * @param {string} commentInput - 使用者輸入的評論
 * @returns {Promise<Object>} 返回更新後的記錄數據
 */
export const commentData = async (id, commentInput) => {
    try {
        // 發送 POST 請求
        const response = await axios.post(`${API_BASE_URL}`, {
            action: 'submit-comment',
            id: id,
            comment: commentInput,
        },{ withCredentials: true });
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
        const response = await axios.post(`${API_BASE_URL}`, {
            params: {
                action: 'get-course-record',
                id: id,
            },
        },{ withCredentials: true });
        console.log(response.data.record);
        return response.data.record; // 假設後端回傳格式包含 `record` 欄位
    } catch (error) {
        console.error('Error fetching user records:', error.response || error.message);
        throw new Error(error.response?.data?.error || '無法取得課程評論');
    }
};