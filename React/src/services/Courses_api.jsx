import axios from 'axios';

const API_BASE_URL = 'https://06b3b194-3a22-44c9-85c7-9a77138d0e79.mock.pstmn.io/courses.php';

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

/**
 * 儲存課程
 * @param {number} courseId - 課程 ID
 * @param {string} username - 使用者名稱
 * @returns {Promise<void>}
 */
export const saveCourse = async (courseId, username) => {
    try {
        await axios.post(`${API_BASE_URL}`, {
            action: 'save-course',
            courseId,
            username,
        });
    } catch (error) {
        console.error('Error saving course:', error.response || error.message);
        throw new Error('儲存課程失敗');
    }
};

/**
 * 取消儲存課程
 * @param {number} courseId - 課程 ID
 * @returns {Promise<void>}
 */
export const unsaveCourse = async (courseId) => {
    try {
        await axios.post(`${API_BASE_URL}`, {
            action: 'unsave-course',
            courseId,
        });
    } catch (error) {
        console.error('Error unsaving course:', error.response || error.message);
        throw new Error('取消儲存課程失敗');
    }
};

/**
 * 取得課程詳細內容
 * @param {number} courseId - 課程 ID
 * @returns {Promise<object>} - 課程詳細內容
 */
export const fetchCourseDetails = async (courseId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}?action=course-details&courseId=${courseId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching course details:', error.response || error.message);
        throw new Error('課程詳細內容取得失敗');
    }
};