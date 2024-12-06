import React from 'react';
import { useLocation } from 'react-router-dom';

const TestPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    // 獲取 source 值
    const source = queryParams.get("source");
    const searchTerm = queryParams.get("searchTerm");
    const queryType = queryParams.get("queryType");
    const isFuzzySearch = queryParams.get("isFuzzySearch");

    // 獲取來源與條件
    const conditions = queryParams.get("conditions");
    


    return (
        <div>
            <h1>Test Page</h1>
            <p>來源表單: {source}</p>
            {source === "search-form" && <p>搜尋字串: {searchTerm}</p>}
            {source === "query-button" && <p>按鈕類型: {queryType}</p>}
            {source === "search-form" && <p>模糊搜尋: {isFuzzySearch === "true" ? "啟用" : "未啟用"}</p>}
            {source === "complex-search" && (<p>複合查詢結果: {conditions ? conditions : "未選擇任何條件"}</p>)}
            <br/>
            <a href="/" class="home-button">回首頁</a>
        </div>
    );
};

export default TestPage;