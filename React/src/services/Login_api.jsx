import axios from 'axios';

// 登入函式
/**
 * 使用者登入
 *
 * @param {string} username - 使用者的帳號
 * @param {string} password - 使用者的密碼
 * @returns {Promise<Object>} - 後端回傳的資料，包含登入是否成功及相關訊息
 */
export const login = async (username, password) => {
    try {
        // 使用 axios 發送 POST 請求到後端的 login.php，攜帶使用者的帳號和密碼
        const response = await axios.post(
            'http://localhost/api/login.php',
            { username, password }, // 請求的主體，包含帳號和密碼
            { withCredentials: true } // 設置 withCredentials 為 true，以便攜帶 Cookie
        );
        // 假設後端回傳的資料格式為 { success: true, username: 'xxx' }
        return response.data; // 返回後端回傳的資料
    } catch (error) {
        // 捕捉並處理任何錯誤
        console.error('Login API error:', error);
        throw error; // 將錯誤拋出以便在呼叫端處理
    }
};

// 登出函式
/**
 * 使用者登出
 *
 * @returns {Promise<Object>} - 後端回傳的資料，包含登出是否成功及相關訊息
 */
export const logout = async () => {
    try {
        // 使用 axios 發送 POST 請求到後端的 logout.php，無需攜帶任何資料
        const response = await axios.post(
            'http://localhost/api/logout.php',
            {}, // 空的請求主體
            { withCredentials: true } // 設置 withCredentials 為 true，以便攜帶 Cookie
        );
        return response.data; // 返回後端回傳的資料
    } catch (error) {
        // 捕捉並處理任何錯誤
        console.error('Logout API error:', error);
        throw error; // 將錯誤拋出以便在呼叫端處理
    }
};

// 檢查登入狀態函式
/**
 * 檢查使用者是否已登入
 *
 * @returns {Promise<Object>} - 後端回傳的資料，包含使用者的登入狀態及相關資訊
 */
export const checkAuthStatus = async () => {
    try {
        // 使用 axios 發送 GET 請求到後端的 check_auth.php，攜帶 Cookie 以驗證登入狀態
        const response = await axios.get(
            'http://localhost/api/check_auth.php',
            { withCredentials: true } // 設置 withCredentials 為 true，以便攜帶 Cookie
        );
        return response.data; // 返回後端回傳的資料
    } catch (error) {
        // 捕捉並處理任何錯誤
        console.error('Check Auth Status API error:', error);
        throw error; // 將錯誤拋出以便在呼叫端處理
    }
};
