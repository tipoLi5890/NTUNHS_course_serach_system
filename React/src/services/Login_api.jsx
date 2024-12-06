import axios from 'axios';

/**
 * 登入 API 請求函式
 * @param {string} username - 使用者帳號
 * @param {string} password - 使用者密碼
 * @returns {Promise<Object>} 回應的資料，包含是否成功及訊息
 */
export const login = async (username, password) => {
    try {
        const response = await axios.post(
            'http://localhost/api/login.php',
            { username, password },
            { withCredentials: true } // 必須攜帶 Cookie
        );

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || '登入失敗');
        }
    } catch (error) {
        cancelAnimationFrameonsole.error('登入失敗:', error.message || error);
        throw new Error(error.response?.data?.message || '伺服器錯誤');
    }
};

/**
 * 登出函式
 */
export const logout = async () => {
    try {
        const response = await axios.post(
            'http://localhost/api/logout.php',
            {},
            { withCredentials: true } // 通知後端清除登入
        );

        return response.data;
    } catch (error) {
        console.error('登出失敗:', error);
        throw new Error('伺服器錯誤',error.response?.data?.message);
    }
};