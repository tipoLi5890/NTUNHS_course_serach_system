import axios from 'axios';

const API_BASE_URL = 'https://65b93dd5-f8eb-42bb-a10c-7a8c9a61162f.mock.pstmn.io';

/**
 * 取得使用者的江湖稱號
 * @param {string} username - 使用者帳號名稱
 * @returns {Promise<Array>} 科系選修課程的清單
 */
export const getUserTitle = async (username) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/userTitle`, {
            action: 'get-user-title',
            username,
        });
        console.log(response.data.userTitle);
        return response.data.userTitle; // 假設後端回傳格式包含 `userTitle` 欄位
    } catch (error) {
        console.error('Error fetching user title:', error.response || error.message);
        throw new Error('取得使用者稱號失敗');
    }
};

/**
 * 取得使用者科系選修的課程 (預設推薦課程內容)
 * @param {string} userID - 使用者ID
 * @returns {Promise<Array>} 科系選修課程的清單
 */
export const getElectiveCourses = async (userID) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/electiveCourses`, {
            action: 'get-elective-courses',
            userID,
        });
        console.log(response.data.electiveCourses);
        return response.data.electiveCourses; // 假設後端回傳格式包含 `electiveCourses` 欄位
    } catch (error) {
        console.error('Error fetching recommended courses:', error.response || error.message);
        throw new Error('取得推薦課程失敗');
    }
};

/**
 * 取得依據使用者測驗結果推薦的課程
 * @param {string} userID - 使用者ID
 * @param {string} testResults - 測驗結果
 * @returns {Promise<Array>} 科系選修課程的清單
 */
export const getRecommendedCourses = async (userID, testResults) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/recommendation`, {
            action: 'get-recommended-courses',
            userID,
            testResults,
        });
        console.log(response.data.recommendation);
        return response.data.recommendation; // 假設後端回傳格式包含 `recommendation` 欄位
    } catch (error) {
        console.error('Error fetching recommended courses:', error.response || error.message);
        throw new Error('取得推薦課程失敗');
    }
};