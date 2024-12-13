import React from 'react';
import ReactDOM from 'react-dom';
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
import TestAnalyze from './pages/recommendation/testAnalyze'; // 測試頁面
import './styles/styles.css';

// 設定 Cookies 為全域變數
window.Cookies = Cookies;

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes>
            <Route path="/Login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/Courses" element={<Courses />} />
            <Route path="/Planning" element={<Planning />} />
            <Route path="/Recommendation" element={<Recommendation />} />
            <Route path="/Record" element={<Record />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/testAnalyze" element={<TestAnalyze />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
);

