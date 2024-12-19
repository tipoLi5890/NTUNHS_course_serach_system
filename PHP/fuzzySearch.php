<?php
// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

session_start(); // 初始化 Session
include("configure.php");

// 驗證使用者登入狀態
if (!isset($_COOKIE['sessionToken']) || !isset($_SESSION['sessionToken']) || $_COOKIE['sessionToken'] !== $_SESSION['sessionToken']) {
    http_response_code(401); // 未授權
    echo json_encode(['error' => '未登入或授權失敗']);
    exit;
}

// 接收使用者輸入
$keyword = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['keyword'])) {
        $keyword = trim($input['keyword']);
    } else {
        http_response_code(400); // 錯誤的請求
        echo json_encode(['error' => '缺少必要參數：keyword']);
        exit;
    }
} else {
    http_response_code(405); // 方法不允許
    echo json_encode(['error' => '僅支援 POST 請求']);
    exit;
}

// 搜尋資料庫
if (!empty($keyword)) {
    try {
        // 確保資料庫連線已建立
        if (!isset($pdo)) {
            throw new Exception('資料庫連接錯誤');
        }

        // 執行查詢
        $sql = "SELECT * FROM 課程 
                WHERE 科目中文名稱 LIKE :keyword 
                OR 科目英文名稱 LIKE :keyword 
                OR 授課教師姓名 LIKE :keyword 
                OR 主開課教師姓名 LIKE :keyword";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['keyword' => '%' . $keyword . '%']);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 回應查詢結果
        if ($results) {
            echo json_encode(['status' => 'success', 'data' => $results]);
        } else {
            echo json_encode(['status' => 'success', 'data' => [], 'message' => '未找到符合條件的課程']);
        }
    } catch (Exception $e) {
        http_response_code(500); // 伺服器錯誤
        echo json_encode(['error' => '伺服器錯誤', 'details' => $e->getMessage()]);
    }
} else {
    http_response_code(400); // 錯誤的請求
    echo json_encode(['error' => '關鍵字不得為空']);
}
?>
