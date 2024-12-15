import axios from 'axios';

const API_BASE_URL = 'https://65b93dd5-f8eb-42bb-a10c-7a8c9a61162f.mock.pstmn.io';

/**
 * 儲存課程
 * @param {number} id - 課程 ID
 * @param {string} userID - 使用者 ID
 * @returns {Promise<void>}
 */
export const saveCourse = async (id, userID) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/save`, {
            action: 'save-course',
            id,
            userID,
        });
        console.log(response.data);
        return response.data; // 回傳伺服器回應，用於 UI 更新
    } catch (error) {
        console.error('Error saving course:', error.response || error.message);
        throw new Error(error.response?.data?.message || '儲存課程失敗');
    }
};

/**
 * 取消儲存課程
 * @param {number} id - 課程 ID
 * @returns {Promise<void>}
 */
export const unsaveCourse = async (id, userID) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/unsave`, {
            action: 'unsave-course',
            id,
            userID,
        });
        console.log(response.data);
        return response.data; // 回傳伺服器回應，用於 UI 更新
    } catch (error) {
        console.error('Error unsaving course:', error.response || error.message);
        throw new Error(error.response?.data?.message || '取消儲存課程失敗');
    }
};

/**
 * 更新儲存(收藏)課程
 * @param {number} userID - 使用者 ID
 * @param {number} id - 課程 ID
 * @param {number} mark - 課程 儲存/取消儲存 mark: 1/0
 * @returns {Promise<void>}
 */
export const toggleCourseMark = async (userID, id, mark) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/mark`, {
            action: 'update-course-mark',
            userID,
            id,
            mark
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating course mark:', error);
        throw error;
    }
};

/**
 * 取得使用者已儲存的課程
 * @param {string} userID - 使用者 ID
 * @returns {Promise<Array>} 已儲存課程的清單
 */
export const getSavedCourses = async (userID) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/courses`, {
            action: 'get-saved-courses',
            userID,
        });
        console.log(response.data.savedCourses);
        return response.data.savedCourses; // 假設後端回傳格式包含 `savedCourses` 欄位
    } catch (error) {
        console.error('Error fetching saved courses:', error.response || error.message);
        throw new Error('取得已儲存課程失敗');
    }
};

/**
 * 取得熱門排行榜課程 (未串接)
 * @returns {Promise<object[]>} - 熱門課程清單
 */
export const fetchHotCourses = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}?action=hot-courses`);
        return response.data;
    } catch (error) {
        console.error('Error fetching hot courses:', error.response || error.message);
        throw new Error('熱門課程取得失敗');
    }
};

