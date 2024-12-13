import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkAuthStatus as checkAuthAPI, login as loginAPI, logout as logoutAPI } from '../services/Login_api';

// 創建一個 AuthContext，用於在組件樹中傳遞認證狀態和方法
const AuthContext = createContext(null);

/**
 * AuthProvider 組件
 * 提供全域的認證狀態和操作方法，讓子組件可以輕鬆存取和修改認證相關的資訊。
 *
 * @param {Object} props - 組件屬性
 * @param {React.ReactNode} props.children - 包裹在 AuthProvider 內的子組件
 */
export const AuthProvider = ({ children }) => {
  // 定義狀態變數，管理使用者是否已認證
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 定義狀態變數，儲存使用者資訊，如 username、role 等
  const [userInfo, setUserInfo] = useState(null);

  /**
   * 檢查使用者的認證狀態
   * 呼叫後端 API 以確認使用者是否已登入，並根據回應更新狀態
   */
  const checkAuthStatus = async () => {
    try {
      // 呼叫 checkAuthAPI，該函式發送 GET 請求到後端以檢查認證狀態
      const data = await checkAuthAPI(); 
      // 假設 checkAuthAPI 回傳的資料格式為 { isLoggedIn: boolean, username: string, ... }

      if (data?.isLoggedIn) { // 檢查回傳的 isLoggedIn 是否為真
        setIsAuthenticated(true); // 更新認證狀態為已認證
        setUserInfo({ username: data.username, ...data }); // 更新使用者資訊，包含 username 和其他資料
      } else {
        setIsAuthenticated(false); // 更新認證狀態為未認證
        setUserInfo(null); // 清除使用者資訊
      }
    } catch (error) { // 捕捉任何錯誤
      console.error('checkAuthStatus error:', error); // 在控制台輸出錯誤訊息
      setIsAuthenticated(false); // 更新認證狀態為未認證
      setUserInfo(null); // 清除使用者資訊
    }
  };

  /**
   * 登入使用者
   * 呼叫後端 API 進行登入操作，並根據回應更新狀態
   *
   * @param {string} username - 使用者的帳號
   * @param {string} password - 使用者的密碼
   * @returns {boolean} - 登入是否成功
   */
  const loginUser = async (username, password) => {
    try {
      // 呼叫 loginAPI，該函式發送 POST 請求到後端進行登入
      const response = await loginAPI(username, password);
      // 假設 loginAPI 成功時回傳的資料格式為 { success: true, username: 'xxx' }

      if (response.success) { // 檢查登入是否成功
        setIsAuthenticated(true); // 更新認證狀態為已認證
        setUserInfo({ username: response.username }); // 更新使用者資訊，僅包含 username
        return true; // 返回成功狀態
      } else {
        setIsAuthenticated(false); // 更新認證狀態為未認證
        setUserInfo(null); // 清除使用者資訊
        return false; // 返回失敗狀態
      }
    } catch (error) { // 捕捉任何錯誤
      console.error('loginUser error:', error); // 在控制台輸出錯誤訊息
      setIsAuthenticated(false); // 更新認證狀態為未認證
      setUserInfo(null); // 清除使用者資訊
      return false; // 返回失敗狀態
    }
  };

  /**
   * 登出使用者
   * 呼叫後端 API 進行登出操作，並根據回應更新狀態
   */
  const logoutUser = async () => {
    try {
      // 呼叫 logoutAPI，該函式發送 POST 請求到後端進行登出
      const response = await logoutAPI();
      // 假設 logoutAPI 成功時回傳的資料格式為 { success: true, message: '已登出' }

      if (response.success) { // 檢查登出是否成功
        setIsAuthenticated(false); // 更新認證狀態為未認證
        setUserInfo(null); // 清除使用者資訊
      }
    } catch (error) { // 捕捉任何錯誤
      console.error('logoutUser error:', error); // 在控制台輸出錯誤訊息
      // 即使登出失敗，也不會改變當前狀態，可以根據需求進一步處理
    }
  };

  // 使用 useEffect 來在組件掛載時檢查使用者的認證狀態
  useEffect(() => {
    // 初始化時檢查登入狀態
    checkAuthStatus();
  }, []); // 空依賴陣列表示只在組件掛載時執行一次

  // 使用 AuthContext.Provider 將認證狀態和操作方法傳遞給子組件
  return (
    <AuthContext.Provider value={{ isAuthenticated, userInfo, loginUser, logoutUser }}>
      {children} {/* 渲染子組件 */}
    </AuthContext.Provider>
  );
};

/**
 * useAuth 自訂 Hook
 * 讓子組件可以輕鬆存取 AuthContext 的值
 *
 * @returns {Object} - 包含 isAuthenticated, userInfo, loginUser, logoutUser
 */
export const useAuth = () => useContext(AuthContext);
