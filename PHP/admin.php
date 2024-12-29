<?php
// -------------------------------------------------------------
// (1) 設定 CORS 和 JSON 回應格式
// -------------------------------------------------------------
include('hostOrigin.php'); // 包含 hostOrigin.php，用來設定允許的來源主機 (CORS 設定相關)
header('Content-Type: application/json'); // 將回應格式設定為 JSON
header('Access-Control-Allow-Methods: POST, OPTIONS'); // 指定允許的 HTTP 方法為 POST 和 OPTIONS
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // 設定允許的請求標頭
header('Access-Control-Allow-Credentials: true'); // 允許在 CORS 中使用 Cookie


session_start(); // 啟動 PHP 的 Session 功能，用來管理伺服器與客戶端之間的狀態
include("configure.php"); // 包含資料庫連線設定檔，假設提供了 PDO 物件 $link


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // OPTIONS 請求回應 200 狀態碼
    exit; // 結束執行，僅回應 CORS 的預檢請求
}

// -------------------------------------------------------------
// (2) 定義錯誤回應函式
// -------------------------------------------------------------
function respondWithError($statusCode, $message)
{
    http_response_code($statusCode); // 設定 HTTP 回應狀態碼
    echo json_encode([ // 回傳 JSON 格式的錯誤訊息
        "message" => $message,
        "success" => false,
    ]);
    exit; // 停止執行，避免後續程式碼繼續執行
}

// -------------------------------------------------------------
// (3) 解析輸入
// -------------------------------------------------------------
$rawInput = file_get_contents('php://input'); // 讀取原始的請求內容（一般用於 JSON 格式的請求）
$jsonInput = json_decode($rawInput, true); // 將 JSON 資料解析為 PHP 陣列

if (json_last_error() === JSON_ERROR_NONE && !empty($jsonInput)) {
    $action = $jsonInput['action'] ?? null; // 從 JSON 資料中提取 action 參數
    $payload = $jsonInput; // 將整個 JSON 資料作為 payload
} else {
    $action = $_POST['action'] ?? null; // 如果 JSON 無效，從 POST 資料中提取 action
    $payload = $_POST; // 將 POST 資料作為 payload
}

// -------------------------------------------------------------
// (4) 定義路由表
// -------------------------------------------------------------
$routes = [
    'getAll' => [
        'file' => './Admin_func/handleGetAllCourses.php',
        'function' => 'handleGetAllCourses',
    ],
    'uploadSingle' => [
        'file' => './Admin_func/handleUploadSingleCourse.php',
        'function' => 'handleUploadSingleCourse',
    ],
    'uploadBatch' => [
        'file' => './Admin_func/handleUploadBatchCourses.php',
        'function' => 'handleUploadBatchCourses',
    ],
    'deleteCourse' => [
        'file' => './Admin_func/handleDeleteCourse.php',
        'function' => 'handleDeleteCourse',
    ],
    'update-student' => [
        'file' => './Admin_func/UpdateStudent.php',
        'function' => 'UpdateStudent',
    ],
    'delete-student' => [
        'file' => './Admin_func/DeleteStudent.php',
        'function' => 'DeleteStudent',
    ],
    'get-all-student' => [
        'file' => './Admin_func/GetAllStudents.php',
        'function' => 'GetAllStudents',
    ],
];

// -------------------------------------------------------------
// (5) 檢查並執行路由
// -------------------------------------------------------------
if (!$action || !isset($routes[$action])) { // 檢查 action 是否存在於路由表中
    respondWithError(400, "未知的 action 參數: $action"); // 回應錯誤，並結束執行
}
$route = $routes[$action]; // 根據 action 從路由表中獲取對應的檔案和函式


try {
    // 使用 $route['file'] 來包含對應的檔案
    include_once $route['file'];

    // 檢查是否實作指定的函式
    $functionName = $route['function']; // 直接從路由中取得函式名稱
    if (!function_exists($functionName)) {
        throw new Exception("未定義的函式: $functionName");
    }

    // 呼叫函式並傳遞 `$payload`
    $functionName($payload);
} catch (Exception $e) {
    respondWithError(500, $e->getMessage());
}
?>
