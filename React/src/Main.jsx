import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import Courses from './pages/courses/Courses';
import Planning from './pages/planning/Planning';
import Recommendation from './pages/recommendation/Recommendation';
import Record from './pages/record/Record';
import NotFound from './pages/notFound/NotFound';
import Admin from './pages/admin/Admin';
import Loader from './components/Loader';
import TestPage from './test';
import TestAnalyze from './pages/recommendation/testAnalyze';
import './styles/styles.css';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hook/AuthProvider';
import { SearchProvider } from './hook/SearchProvider';

window.Cookies = Cookies;

const container = document.getElementById('root');
const root = createRoot(container);

const App = () => {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 400);
        return () => clearTimeout(timer);
    }, [location]);

    return (
        <>
            {/* 載入動畫 */}
            <Loader isLoading={isLoading} />
            <Routes>
                <Route path="/Login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route path="/Courses" element={<Courses />} />
                <Route
                    path="/Planning"
                    element={
                        <ProtectedRoute>
                            <Planning />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/Recommendation"
                    element={
                        <ProtectedRoute>
                            <Recommendation />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/Record"
                    element={
                        <ProtectedRoute>
                            <Record />
                        </ProtectedRoute>
                    }
                />
                <Route path="/Admin" element={<Admin />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/testAnalyze" element={<TestAnalyze />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

root.render(
    <React.StrictMode>
        <AuthProvider>
            <SearchProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </SearchProvider>
        </AuthProvider>
    </React.StrictMode>
);
