<?php
// 設定 CORS 和 JSON 回應格式
include('hostOrigin.php');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS'); // 添加 GET 方法
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // 添加 Authorization 標頭
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
if (!isset($input['action']) || $input['action'] !== 'search' || !isset($input['searchTerm'])) {
    http_response_code(400);
    echo json_encode([
        "message" => "缺少必要的參數",
        "success" => false
    ]);
    exit;
}

// 提取參數
$action = $input['action'];
$isFuzzySearch = isset($input['isFuzzySearch']) ? (bool)$input['isFuzzySearch'] : false;
$searchTerm = trim($input['searchTerm']);


try {
    // 假設您有一個變數來決定是否插入 'mark' 這個欄位
    $includeMark = isset($_SESSION['userID']); // 或者根據您的業務邏輯設置為 false

    // 開始構建 SELECT 子句
    $selectFields = "
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
    ";

    // 根據條件決定是否插入 'mark' 欄位
    if ($includeMark) {
        $selectFields .= ",
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM 用戶收藏 u 
                WHERE u.用戶ID = :userID AND u.課程ID = k.編號
            ) THEN 1
            ELSE 0
        END AS mark";
    }

    // 準備 SQL 查詢
    if ($isFuzzySearch) {
        // 模糊查詢 SQL
        $sql = "
            SELECT $selectFields
            FROM `課程` k
            LEFT JOIN `系所對照表` d ON k.`系所代碼` = d.`系所代碼`
            WHERE 
                k.`學期` = :academicYear AND (
                `k`.`科目中文名稱` LIKE :keyword 
                OR `k`.`科目英文名稱` LIKE :keyword 
                OR `k`.`授課教師姓名` LIKE :keyword 
                OR `k`.`主開課教師姓名` LIKE :keyword 
                OR `k`.`課程中文摘要` LIKE :keyword 
                OR `k`.`課程英文摘要` LIKE :keyword
                OR `k`.`學期` LIKE :keyword
                OR `k`.`年級` LIKE :keyword
                OR `k`.`系所代碼` LIKE :keyword
                OR `k`.`課別名稱` LIKE :keyword
                OR `k`.`上課地點` LIKE :keyword
                OR `k`.`課程編號` LIKE :keyword
                OR `k`.`上課星期` LIKE :keyword
                OR `k`.`上課節次` LIKE :keyword
                OR `k`.`授課教師代碼_舊碼` LIKE :keyword
                OR `k`.`主開課教師代碼_舊碼` LIKE :keyword)
        ";
        $stmt = $link->prepare($sql);
        $likeKeyword = '%' . $searchTerm . '%';
        // 由於 :keyword 在 SQL 中多次出現，需要為每個出現位置使用唯一的參數
        // 或者改用命名參數並重複綁定。以下為簡化處理，假設 PDO 支援多次綁定
        $stmt->bindValue(':keyword', $likeKeyword, PDO::PARAM_STR);
    } else {
        // 精準查詢 SQL
        $sql = "
            SELECT $selectFields
            FROM `課程` k
            LEFT JOIN `系所對照表` d ON k.`系所代碼` = d.`系所代碼`
            WHERE 
                k.`學期` = :academicYear AND(
                `k`.`科目中文名稱` = :keyword 
                OR `k`.`科目英文名稱` = :keyword 
                OR `k`.`授課教師姓名` = :keyword 
                OR `k`.`主開課教師姓名` = :keyword 
                OR `k`.`課程中文摘要` = :keyword 
                OR `k`.`課程英文摘要` = :keyword
                OR `k`.`學期` = :keyword
                OR `k`.`年級` = :keyword
                OR `k`.`系所代碼` = :keyword
                OR `k`.`課別名稱` = :keyword
                OR `k`.`上課地點` = :keyword
                OR `k`.`課程編號` = :keyword
                OR `k`.`上課星期` = :keyword
                OR `k`.`上課節次` = :keyword
                OR `k`.`授課教師代碼_舊碼` = :keyword
                OR `k`.`主開課教師代碼_舊碼` = :keyword)
        ";
        $stmt = $link->prepare($sql);
        $stmt->bindValue(':keyword', $searchTerm, PDO::PARAM_STR);
    }

    include("utils.php"); // 載入工具函數
    
    // 計算學年度和學期
    $academicYear = getAcademicYearAndSemester();
    
    // 綁定 userID 參數
    $stmt->bindParam(':userID', $userId, PDO::PARAM_STR);
    $stmt->bindValue(':academicYear', $academicYear, PDO::PARAM_STR);

    // 執行查詢
    $stmt->execute();

    // 檢查是否有課程資料
    if ($stmt->rowCount() > 0) {
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        // 回傳課程資料
        echo json_encode([
            "message" => "查詢成功",
            "success" => true,
            "courses" => $courses
        ]);
    } else {
        // 如果沒有課程資料
        echo json_encode([
            "message" => "沒有找到相關課程",
            "success" => false
        ]);
    }
} catch (Exception $e) {
    // 查詢出現錯誤
    http_response_code(500);
    echo json_encode([
        "message" => "伺服器錯誤，無法查詢課程",
        "success" => false
    ]);
}
?>
