import React from 'react'; // 引入 React 庫，用於創建 React 組件
import { createRoot } from 'react-dom/client'; // 引入 createRoot，用於在新的 React 18 中創建根節點
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // 引入 React Router 的組件，用於處理前端路由
import Cookies from 'js-cookie'; // 引入 js-cookie 庫，用於操作瀏覽器中的 Cookie
import Login from './pages/login/Login'; // 引入登入頁面的組件
import Home from './pages/home/Home'; // 引入首頁的組件
import Courses from './pages/courses/Courses'; // 引入課程頁面的組件
import Planning from './pages/planning/Planning'; // 引入規劃頁面的組件
import Recommendation from './pages/recommendation/Recommendation'; // 引入推薦頁面的組件
import Record from './pages/record/Record'; // 引入記錄頁面的組件
import NotFound from './pages/notFound/NotFound'; // 引入未找到頁面的組件
import TestPage from './test'; // 引入測試頁面的組件
import './styles/styles.css'; // 引入全域的 CSS 樣式
import ProtectedRoute from './components/ProtectedRoute'; // 引入受保護路由的組件，用於檢查使用者是否已登入
import { AuthProvider } from './hook/AuthProvider'; // 引入認證提供者組件，用於管理全域的認證狀態

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
            <BrowserRouter> {/* BrowserRouter 提供使用 HTML5 History API 的路由功能，允許使用者在前端導航 */}
                <Routes> {/* Routes 用於包裹所有 Route，定義應用的路由結構 */}
                    {/* 定義 /Login 路徑對應的 Login 組件 */}
                    <Route path="/Login" element={<Login />} />

                    {/* 定義 / 路徑（首頁）對應的 Home 組件 */}
                    <Route path="/" element={<Home />} />

                    {/* 定義 /Courses 路徑對應的 Courses 組件 */}
                    <Route path="/Courses" element={<Courses />} />

                    {/* ------- */}
                    {/* 使用 ProtectedRoute 組件包裹需要登入才能訪問的路由 */}
                    {/* ProtectedRoute 會檢查使用者是否已登入，若未登入則重定向至 /Login */}
                    
                    {/* 定義 /Planning 路徑對應的 Planning 組件，並使用 ProtectedRoute 保護 */}
                    <Route path="/Planning" element={
                        <ProtectedRoute>
                            <Planning />
                        </ProtectedRoute>
                    } />

                    {/* 定義 /Recommendation 路徑對應的 Recommendation 組件，並使用 ProtectedRoute 保護 */}
                    <Route path="/Recommendation" element={
                        <ProtectedRoute>
                            <Recommendation />
                        </ProtectedRoute>
                    } />

                    {/* 定義 /Record 路徑對應的 Record 組件，並使用 ProtectedRoute 保護 */}
                    <Route path="/Record" element={
                        <ProtectedRoute>
                            <Record />
                        </ProtectedRoute>
                    } />
                    {/* ------- */}

                    {/* 定義 /test 路徑對應的 TestPage 組件，用於測試 */}
                    <Route path="/test" element={<TestPage />} />

                    {/* 定義所有未匹配到的路徑（*）對應的 NotFound 組件，用於顯示 404 頁面 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);
