import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cookies from 'js-cookie'; // 引入 js-cookie 庫，用於操作瀏覽器中的 Cookie
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import Courses from './pages/courses/Courses';
import Planning from './pages/planning/Planning';
import Recommendation from './pages/recommendation/Recommendation';
import Record from './pages/record/Record';
import NotFound from './pages/notFound/NotFound';
import Admin from './pages/admin/Admin';
import TestPage from './test';
import TestAnalyze from './pages/recommendation/testAnalyze'; // 測試頁面
import './styles/styles.css'; // 全域的 CSS 樣式
import ProtectedRoute from './components/ProtectedRoute'; // 受保護路由的組件，檢查使用者是否已登入
import { AuthProvider } from './hook/AuthProvider'; // 認證提供者組件，管理全域的認證狀態
import { SearchProvider } from './hook/SearchProvider'; // 認證提供者組件，管理全域的認證狀態

// 將 js-cookie 的 Cookies 對象設置為全域變數，方便在其他地方使用
window.Cookies = Cookies;

// 獲取 HTML 中 id 為 'root' 的元素，這是 React 應用掛載的根節點
const container = document.getElementById('root');

// 使用 createRoot 方法創建一個 React 根節點，並將其綁定到 container 上
const root = createRoot(container);

// 使用 root.render 方法渲染 React 應用
root.render(
    <React.StrictMode> {/* React.StrictMode 是一個幫助檢測潛在問題的工具，只在開發模式下有效 */}
        <AuthProvider> {/* AuthProvider 提供全域的認證狀態，讓子組件可以訪問和修改認證資訊 */}
            <SearchProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/Login" element={<Login />} />

                        <Route path="/" element={<Home />} />

                        <Route path="/Courses" element={<Courses />} />

                        {/* 使用 ProtectedRoute 組件包裹需要登入才能訪問的路由 */}
                        {/* ProtectedRoute 會檢查使用者是否已登入，若未登入則重定向至 /Login */}

                        {/* 使用 ProtectedRoute 保護 */}
                        <Route path="/Planning" element={
                            <ProtectedRoute>
                                <Planning />
                            </ProtectedRoute>
                        } />

                        {/* 使用 ProtectedRoute 保護 */}
                        <Route path="/Recommendation" element={
                            <ProtectedRoute>
                                <Recommendation />
                            </ProtectedRoute>
                        } />

                        {/* 使用 ProtectedRoute 保護 */}
                        <Route path="/Record" element={
                            <ProtectedRoute>
                                <Record />
                            </ProtectedRoute>
                        } />

                        {/* 使用 ProtectedRoute 保護 */}
                        <Route path="/Admin" element={
                                <Admin />
                        } />

                        <Route path="/test" element={<TestPage />} />

                        <Route path="/testAnalyze" element={<TestAnalyze />} />

                        {/* 定義所有未匹配到的路徑（*）對應的 NotFound 組件，用於顯示 404 頁面 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </SearchProvider>
        </AuthProvider>
    </React.StrictMode>
);
