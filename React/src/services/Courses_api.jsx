import axios from 'axios';

const API_BASE_URL = '/api/collection_courses.php';

/**
 * 儲存課程
 * @param {number} id - 課程 ID
 * @returns {Promise<void>}
 */
export const saveCourse = async (id) => {
    try {
        const response = await axios.post(`${API_BASE_URL}`, {
            action: 'save-course',
            id,
        }, { withCredentials: true });
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
export const unsaveCourse = async (id) => {
    try {
        const response = await axios.post(`${API_BASE_URL}`, {
            action: 'unsave-course',
            id,
        }, { withCredentials: true });
        console.log(response.data);
        return response.data; // 回傳伺服器回應，用於 UI 更新
    } catch (error) {
        console.error('Error unsaving course:', error.response || error.message);
        throw new Error(error.response?.data?.message || '取消儲存課程失敗');
    }
};

/**
 * 取得使用者已儲存的課程
 * @param {string} userID - 使用者 ID
 * @returns {Promise<Array>} 已儲存課程的清單
 */
export const getSavedCourses = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}`, {
            action: 'get-saved-courses',
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
        const response = await axios.post(`${API_BASE_URL}?action=hot-courses`);
        return response.data;
    } catch (error) {
        console.error('Error fetching hot courses:', error.response || error.message);
        throw new Error('熱門課程取得失敗');
    }
};

