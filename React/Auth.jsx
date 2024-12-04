import Cookies from 'js-cookie';

/**
 * 取得登入狀態
 * @returns {boolean} 是否已登入
 */
export const isLoggedIn = () => {
    return Cookies.get('isLoggedIn') === 'true';
};

/**
 * 取得目前登入的使用者名稱
 * @returns {string|null} 登入的使用者名稱
 */
export const getUsername = () => {
    return Cookies.get('username');
};