import axios from 'axios';

const API_BASE_URL = 'https://65b93dd5-f8eb-42bb-a10c-7a8c9a61162f.mock.pstmn.io';

/**
 * 取得使用者已儲存的當期科系必修課程
 * @param {string} userID - 使用者ID
 * @returns {Promise<Array>} 已儲存當期必修課程的清單
 */
export const getSavedRequiredCourses = async (userID) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/required`, {
            action: 'get-saved-required',
            userID,
        });
        console.log(response.data.savedRequired);
        return response.data.savedRequired; // 假設後端回傳格式包含 `savedRequired` 欄位
    } catch (error) {
        console.error('Error fetching saved required courses:', error.response || error.message);
        throw new Error('無法取得已儲存的預設課程');
    }
};

/**
 * 取得使用者已儲存的其他課程
 * @param {string} userID - 使用者ID
 * @returns {Promise<Array>} 已儲存其他課程的清單
 */
export const getSavedElectiveCourses = async (userID) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/elective`, {
            action: 'get-saved-elective',
            userID,
        });
        console.log(response.data.savedElective);
        return response.data.savedElective; // 假設後端回傳格式包含 `savedElective` 欄位
    } catch (error) {
        console.error('Error fetching saved elective courses:', error.response || error.message);
        throw new Error('無法取得已儲存的其他課程');
    }
};

/**
 * 更新課程的顯示/隱藏狀態
 * @param {string} userID - 使用者ID
 * @param {string} id - 課程 ID
 * @param {string} isPlaced - 課程顯示/隱藏 isPlaced: 1/0
 * @returns {Promise<Array>} ？
 */
export const updateCourseVisibility = async (userID, id, isPlaced) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/visibility`, {
        action: 'update-course-visibility',
        userID,
        id,
        isPlaced,
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating course visibility:', error);
      throw error;
    }
  };

/**
 * 取得使用者已儲存的某課程詳細資訊
 * @param {string} userID - 使用者ID
 * @param {string} id - 課程 ID
 * @returns {Promise<Array>} 已儲存的某課程詳情
 */
export const savedCourseDetail = async (userID, id) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/detail`, {
            action: 'get-saved-detail',
            userID,
            id,
        });

        if (response.data?.success && Array.isArray(response.data.courseDetail)) {
            console.log(response.data.courseDetail);
            return response.data.courseDetail; // 假設後端回傳格式包含 `courseDetail` 欄位
        } else {
            console.error('Unexpected response structure:', response.data);
            throw new Error('後端回傳格式不正確');
        }
    } catch (error) {
        console.error('Error fetching saved course detail:', error.response || error.message);
        throw new Error('無法取得該課程的詳細資訊');
    }
};

