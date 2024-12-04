import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cookies from 'js-cookie'; 
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import Courses from './pages/courses/Courses';
import Planning from './pages/planning/Planning';
import Recommendation from './pages/recommendation/Recommendation';
import Record from './pages/record/Record';
import NotFound from './pages/notFound/NotFound';
import TestPage from './test'; // 測試頁面
import './styles/styles.css';

// 設定 Cookies 為全域變數
window.Cookies = Cookies;

// 獲取 HTML 的 root 元素
const container = document.getElementById('root');

// 初始化 React 應用，使用 createRoot 方法
const root = createRoot(container);

// 渲染應用內容
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/Login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route path="/Courses" element={<Courses />} />
                <Route path="/Planning" element={<Planning />} />
                <Route path="/Recommendation" element={<Recommendation />} />
                <Route path="/Record" element={<Record />} />
                <Route path="/test" element={<TestPage />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

