import axios from 'axios';

const API_BASE_URL = 'https://06b3b194-3a22-44c9-85c7-9a77138d0e79.mock.pstmn.io/courses.php';

/**
 * 儲存課程
 * @param {number} id - 課程 ID
 * @param {string} userID - 使用者名稱
 * @returns {Promise<void>}
 */
export const saveCourse = async (id, userID) => {
    try {
        const response = await axios.post(`${API_BASE_URL}`, {
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
        const response = await axios.post(`${API_BASE_URL}`, {
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
 * 取得使用者已儲存的課程
 * @param {string} userID - 使用者名稱
 * @returns {Promise<Array>} 已儲存課程的清單
 */
export const getSavedCourses = async (userID) => {
    try {
        const response = await axios.get(`${API_BASE_URL}`, {
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
 * 提交課程評價
 * @param {number} courseId - 課程 ID
 * @param {string} username - 使用者名稱
 * @param {number} rating - 評分 (1~5)
 * @param {string} review - 使用者評論
 * @returns {Promise<void>}
 */
export const submitCourseReview = async (courseId, username, rating, review) => {
    try {
        await axios.post(`${API_BASE_URL}`, {
            action: 'submit-review',
            courseId,
            username,
            rating,
            review,
        });
    } catch (error) {
        console.error('Error submitting course review:', error.response || error.message);
        throw new Error('提交課程評價失敗');
    }
};

/**
 * 取得課程評價清單
 * @param {number} courseId - 課程 ID
 * @returns {Promise<object[]>} - 評價清單
 */
export const fetchCourseReviews = async (courseId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}?action=fetch-reviews&courseId=${courseId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching course reviews:', error.response || error.message);
        throw new Error('課程評價取得失敗');
    }
};

/**
 * 取得熱門排行榜課程
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

