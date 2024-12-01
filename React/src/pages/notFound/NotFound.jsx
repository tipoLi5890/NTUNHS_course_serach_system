import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>404 - 頁面不存在</h1>
            <p>很抱歉，我們找不到您要訪問的頁面。</p>
            <Link to="/">回到首頁</Link>
        </div>
    );
};

export default NotFound;
