<?php
// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173'); // 根據需要調整
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); // 添加 GET 方法
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

// 檢查 Session Token
if (isset($_COOKIE['sessionToken']) && isset($_SESSION['sessionToken'])) {
    if ($_COOKIE['sessionToken'] === $_SESSION['sessionToken']) {
        // 驗證成功，可以進一步處理請求

        if (isset($_SESSION['userID'])) {
            $userId = $_SESSION['userID'];  // 取得用戶ID
            // 步驟 1: 取得當前的西元年月日
            $gregorianYear = date('Y'); // 西元年，例如 2024
            $month = date('n');          // 月份，1-12
            $day = date('j');            // 日，1-31

            // 步驟 2: 轉換為民國年
            $minguoYear = $gregorianYear - 1911;

            // 初始化學年度和學期變數
            $academicYear = '';
            $semester = '';

            // 步驟 3: 判斷目前所在的學期
            if ($month >= 8) {
                // 如果現在是8月到12月，屬於當前年份的上學期
                $academicYear = $minguoYear;
                $semester = '1';
            } elseif ($month >= 2 && $month <= 7) {
                // 如果現在是2月到7月，屬於前一年的下學期
                $academicYear = $minguoYear - 1;
                $semester = '2';
            } else { // $month == 1
                // 如果現在是1月，屬於前一年的上學期
                $academicYear = $minguoYear - 1;
                $semester = '1';
            }

            // 步驟 4: 設置 $academicYear 變數，尾部加上學期數字
            $academicYear .= $semester;
            
            try {
                // 準備 SQL 查詢
                if ($isFuzzySearch) {
                    // 模糊查詢 SQL
                    $sql = "
                        SELECT k.*,
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
                            p.評價文本, 
                            p.評價時間, 
                            d.系所名稱,
                            CASE 
                                WHEN EXISTS (
                                    SELECT 1 
                                    FROM 用戶收藏 u 
                                    WHERE u.用戶ID = :userID AND u.課程ID = k.編號
                                ) THEN 1
                                ELSE 0
                            END AS mark
                        FROM `課程` k
                        LEFT JOIN `課程評價` p ON k.`編號` = p.`課程ID`
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
                        SELECT k.*,
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
                            p.評價文本, 
                            p.評價時間, 
                            d.系所名稱,
                            CASE 
                                WHEN EXISTS (
                                    SELECT 1 
                                    FROM 用戶收藏 u 
                                    WHERE u.用戶ID = :userID AND u.課程ID = k.編號
                                ) THEN 1
                                ELSE 0
                            END AS mark
                        FROM `課程` k
                        LEFT JOIN `課程評價` p ON k.`編號` = p.`課程ID`
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
        } else {
            // 如果用戶ID不存在
            http_response_code(403);
            echo json_encode([
                "message" => "未找到用戶ID，請重新登入",
                "success" => false
            ]);
        }
        
    } else {
        // 驗證失敗，返回未授權狀態
        http_response_code(402);
        echo json_encode([
            "message" => "無效的 Session Token，請重新登入",
            "success" => false
        ]);
        exit;
    }
} else {
    // 沒有 Session Token，可能未登入或 Session 過期
    http_response_code(401);
    echo json_encode([
        "message" => "Session 過期或未登入",
        "success" => false,
    ]);
    exit;
}
?>
