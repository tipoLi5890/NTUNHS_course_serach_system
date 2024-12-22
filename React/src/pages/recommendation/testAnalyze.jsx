import { useLocation, useNavigate } from "react-router-dom";

const TestAnalyze = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location || {}; // 確保 location 不為空
    const { results, userID } = state || {}; // 確保 results 和 username 不為空
    

    if (!results || !userID) {
        return <div>無資料傳遞，請重試。</div>;
    }

    // 計算 analyzeType：將答案組合成百位數、十位數、個位數
    const analyzeType = results
        .map((result) => result.answer) // 提取答案
        .join(""); // 組合為字串

    const handleConfirm = () => {
        // 將 analyzeType 傳至 Recommendation 頁面
        navigate("/recommendation", { state: { analyzeType } });
    };

    return (
        <div>
            <h1>測驗結果分析</h1>
            <p>使用者名稱: {userID}</p>
            <ul>
                {results.map((result, index) => (
                    <li key={index}>
                        問題: {index + 1}, 答案: {result.answer}
                    </li>
                ))}
            </ul>
            <p>分析類型 (analyzeType): {analyzeType}</p>
            <button onClick={handleConfirm}>確認</button>
        </div>
    );
};

export default TestAnalyze;
