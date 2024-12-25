<?php
// -------------------------------------------------------------
// 函式區：模糊查詢學生資訊
// 功能介紹：
// 此函式用於從資料庫中模糊查詢學生資料，允許管理者根據學生的姓名或帳號進行模糊搜索。
// 回傳結果包括學生的帳號、密碼、姓名與狀態，以 JSON 格式回應，並告知查詢是否成功。
//
// 使用方法：
// - Action: search-student
// - HTTP 方法：POST
// - 參數格式 (JSON):
//   {
//       "action": "search-student",
//       "searchTerm": "關鍵字"
//   }
//
// 回傳格式：JSON
// - 成功：
//   {
//       "message": "查詢成功",
//       "success": true,
//       "users": [
//           {
//               "帳號": "112214227",
//               "密碼": "hashed_password",
//               "姓名": "林耕宇",
//               "狀態": "active"
//           },
//           ...
//       ]
//   }
// - 失敗：
//   {
//       "message": "查詢失敗: 錯誤訊息",
//       "success": false
//   }
//
// 功能邏輯：
// 1. 接收前端傳入的查詢參數 `searchTerm`，確保格式正確。
// 2. 執行模糊查詢 `SELECT` 語句，篩選帳號或姓名包含關鍵字的資料。
// 3. 若查詢成功，將資料轉為 JSON 格式回傳；若失敗，回傳錯誤訊息，並設定 HTTP 狀態碼。
// -------------------------------------------------------------

// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173'); // 根據需要調整
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS'); // 添加 OPTIONS 方法
header('Access-Control-Allow-Headers: Content-Type, Authorization'); 
header('Access-Control-Allow-Credentials: true'); // 啟用 Cookie 傳遞

session_start(); // 初始化 Session
include("configure.php"); // 包含資料庫配置

// 處理 OPTIONS 請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 獲取前端傳入的 JSON 資料
$input = json_decode(file_get_contents('php://input'), true);

// 驗證 JSON 解析結果
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        "message" => "無效的 JSON 格式",
        "success" => false
    ]);
    exit;
}

// 檢查必要的參數
if (!isset($input['action']) || $input['action'] !== 'search-student' || !isset($input['searchTerm'])) {
    http_response_code(400);
    echo json_encode([
        "message" => "缺少必要的參數",
        "success" => false
    ]);
    exit;
}

// 提取參數
$searchTerm = trim($input['searchTerm']);

try {
    // 準備模糊查詢 SQL
    $sql = "
        SELECT 
            用戶.帳號, 
            用戶.密碼, 
            用戶.姓名, 
            用戶.狀態
        FROM 
            用戶
        WHERE 
            用戶.帳號 LIKE :keyword 
            OR 用戶.姓名 LIKE :keyword
    ";

    $stmt = $link->prepare($sql);

    // 綁定參數
    $likeKeyword = '%' . $searchTerm . '%';
    $stmt->bindValue(':keyword', $likeKeyword, PDO::PARAM_STR);

    // 執行查詢
    $stmt->execute();

    // 檢查是否有用戶資料
    if ($stmt->rowCount() > 0) {
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode([
            "message" => "查詢成功",
            "success" => true,
            "student" => $users
        ]);
    } else {
        echo json_encode([
            "message" => "沒有找到相關用戶",
            "success" => false
        ]);
    }
} catch (Exception $e) {
    // 查詢出現錯誤
    http_response_code(500);
    echo json_encode([
        "message" => "伺服器錯誤，無法查詢用戶",
        "success" => false
    ]);
}
?>