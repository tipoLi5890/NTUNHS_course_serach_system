<?php
// -------------------------------------------------------------
// (1) 函式區：查詢所有課程
// -------------------------------------------------------------
// 功能介紹：
// 此函式用於查詢所有課程的資訊，並將課程的上課星期（轉換為中文）以及所屬系所名稱一同回傳。
// 該 API 提供課程資料的查詢，返回資料中包括課程的詳細資料（如課程名稱、時間、系所等）。
//
// 使用方法：
// - Action: get-all-courses
// - HTTP 方法：GET
// - 回傳格式：JSON
// - 回傳內容：
//   - message：回應訊息，指示查詢是否成功。
//   - success：布林值，標示操作是否成功。
//   - courses：一個包含所有課程資料的陣列，包含課程 ID、課程名稱、上課星期中文、系所名稱等。
//   
// 成功回傳範例：
// {
//     "message": "查詢成功",
//     "success": true,
//     "courses": [
//         {
//             "課程ID": "001",
//             "課程名稱": "程式設計",
//             "上課星期中文": "星期一",
//             "系所名稱": "資訊工程學系"
//         },
//         ...
//     ]
// }
//
// 失敗回傳範例：
// {
//     "message": "查詢失敗，請稍後再試",
//     "success": false
// }
//
// 功能邏輯：
// 1. 查詢資料庫中的所有課程資料，並將上課星期數字轉換為中文。
// 2. 透過 LEFT JOIN 操作將課程資料與系所資料連接，取得系所名稱。
// 3. 若查詢成功，將課程資料回傳；若查詢失敗，回傳錯誤訊息。
// -------------------------------------------------------------

/**
 * sendResponse - 回傳 JSON 格式的回應
 * @param int $statusCode HTTP 狀態碼
 * @param string $message 回應訊息
 * @param bool $success 是否成功
 * @param array|null $data 需要回傳的資料（可選）
 */
function sendResponse($statusCode, $message, $success, $data = null) {
    http_response_code($statusCode);
    $response = [
        "message" => $message,
        "success" => $success,
    ];
    
    if (!empty($data)) {
        $response['courses'] = $data;
    }

    echo json_encode($response);
    exit;
}

/**
 * handleGetAllCourses - 查詢所有課程
 * 回傳上課星期中文 & 系所名稱
 */
function handleGetAllCourses() {
    global $link;

    $sql = "
        SELECT 
            k.*,
            CASE 
                WHEN k.上課星期 = '1' THEN '星期一'
                WHEN k.上課星期 = '2' THEN '星期二'
                WHEN k.上課星期 = '3' THEN '星期三'
                WHEN k.上課星期 = '4' THEN '星期四'
                WHEN k.上課星期 = '5' THEN '星期五'
                WHEN k.上課星期 = '6' THEN '星期六'
                WHEN k.上課星期 = '7' THEN '星期日'
                ELSE '未知'
            END AS 上課星期中文,
            d.系所名稱
        FROM 課程 k
        LEFT JOIN 系所對照表 d ON k.系所代碼 = d.系所代碼
    ";

    try {
        $stmt = $link->prepare($sql);
        $stmt->execute();
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 回傳課程資料
        sendResponse(200, "查詢成功", true, $courses);
    } catch (Exception $e) {
        // 錯誤處理，避免暴露過多訊息
        sendResponse(500, "查詢失敗，請稍後再試", false);
    }
}
?>
