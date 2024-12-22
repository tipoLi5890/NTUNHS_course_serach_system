import axios from 'axios';

const API_BASE_URL = '/api/recommendation.php';

/**
 * 取得使用者的江湖稱號
 * @returns {Promise<string>} 使用者稱號
 */
export const GetUserType = async () => {
    try {
        const response = await axios.post(
            API_BASE_URL,
            { action: 'get-user-type' },
            { withCredentials: true }
        );
        console.log(response.data); // 確認回傳結構

        if (response.data.success && response.data.type) {
            return response.data.type; // 回傳稱號
        } else {
            return null; // 若無稱號，回傳 null
        }
    } catch (error) {
        console.error('Error fetching user title:', error.response || error.message);
        throw new Error('取得使用者稱號失敗');
    }
};

/**
 * 更新使用者的推薦類型
 * @param {string} type - 新的推薦類型
 * @returns {Promise<void>}
 */
export const saveUserType = async (type) => {
    try {
        const response = await axios.post(
            API_BASE_URL,
            { action: 'save-user-type', type },
            { withCredentials: true }
        );
        console.log(response.data.message);
        return response.data.message;
    } catch (error) {
        console.error('Error saving user type:', error.response || error.message);
        throw new Error('更新推薦類型失敗');
    }
};

/**
 * 取得依據使用者測驗結果推薦的課程
 * @param {string} type - 測驗結果
 * @returns {Promise<Array>} 推薦課程的清單
 */
export const getRecommendedCourses = async (type) => {
    try {
        const response = await axios.post(
            API_BASE_URL,
            { action: 'get-recommended-courses', type },
            { withCredentials: true }
        );
        console.log(response.data.recommendation);
        return response.data.recommendation; // 後端回傳的推薦課程清單
    } catch (error) {
        console.error('Error fetching recommended courses:', error.response || error.message);
        throw new Error('取得推薦課程失敗');
    }
};