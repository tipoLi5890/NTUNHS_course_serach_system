<?php
// -------------------------------------------------------------
// (1) 設定 CORS 和 JSON 回應格式
// -------------------------------------------------------------
header('Access-Control-Allow-Origin: http://localhost:5173'); // 根據需要調整
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS'); // 統一使用 POST 方法
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true'); // 啟用 Cookie 傳遞

session_start(); // 初始化 Session
include("configure.php"); // 包含資料庫連線設定 (PDO: $link)

// 處理 OPTIONS 請求（CORS 預檢）
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -------------------------------------------------------------
// (2) 判斷是否有登入 Session 並檢查角色
// -------------------------------------------------------------
// if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
//     http_response_code(401);
//     echo json_encode([
//         "message" => "未授權訪問：需要 admin 權限",
//         "success" => false
//     ]);
//     exit;
// }


// -------------------------------------------------------------
// (3) 解析輸入
//     - 如果是 JSON: 透過 file_get_contents + json_decode
//     - 如果是檔案上傳: 需要從 $_POST / $_FILES 取得
// -------------------------------------------------------------
$rawInput = file_get_contents('php://input');

// 嘗試解析 JSON，若解析失敗或是空的，代表可能是 multipart/form-data
$jsonInput = json_decode($rawInput, true);
if (json_last_error() === JSON_ERROR_NONE && $jsonInput !== null) {
    // 以 JSON 方式提交
    $action = isset($jsonInput['action']) ? $jsonInput['action'] : null;
    $payload = $jsonInput; // 其他參數
} else {
    // 以 multipart/form-data 方式提交，action 從 $_POST 拿
    $action = isset($_POST['action']) ? $_POST['action'] : null;
    $payload = $_POST; // 其他參數 (不含檔案)
}

// -------------------------------------------------------------
// (4) 檢查 action
// -------------------------------------------------------------
if (!$action) {
    http_response_code(400);
    echo json_encode([
        "message" => "缺少 action 參數",
        "success" => false
    ]);
    exit;
}

// -------------------------------------------------------------
// (5) 根據 action 路由
// -------------------------------------------------------------
switch ($action) {
    case 'getAll': // OK
        include("./Admin_func/handleGetAllCourses.php");
        handleGetAllCourses();
        break;

    case 'uploadSingle': // OK
        include("./Admin_func/handleUploadSingleCourse.php");
        handleUploadSingleCourse();
        break;

    case 'uploadBatch': // OK
        include("./Admin_func/handleUploadBatchCourses.php");
        handleUploadBatchCourses();
        break;

    case 'updateCourse':
        include("./Admin_func/handleUpdateCourse.php");
        handleUpdateCourse($payload);
        break;

    case 'deleteCourse': // OK
        include("./Admin_func/handleDeleteCourse.php");
        handleDeleteCourse($payload);
        break;

    default:
        http_response_code(400);
        echo json_encode([
            "message" => "未知的 action 參數: $action",
            "success" => false
        ]);
        break;
}
?>
