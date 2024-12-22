<?php
// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173'); // 根據需要調整
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS'); // 統一使用 POST 方法
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

// 檢查Cookie
if (!isset($_SESSION['userID'])) {
    http_response_code(401);
    echo json_encode([
        "message" => "Session 過期或未登入",
        "success" => false,
    ]);
    exit;
}

// 檢查必要的參數
if (!isset($input['action'])) {
    http_response_code(400);
    echo json_encode([
        "message" => "缺少 action 參數",
        "success" => false
    ]);
    exit;
}

// 提取 action 參數
$action = $input['action'];

// 根據 action 路由到不同的處理函數
switch ($action) {
    case 'get-user-type': // OK
        handleGetUserType();
        break;

    case 'save-user-type': // OK
        handleSaveUserType($input);
        break;
    
    case 'get-recommended-courses':
        handleGetRecommendedCourses($input);
        break;
    
    default:
        http_response_code(400);
        echo json_encode([
            "message" => "未知的 action 參數",
            "success" => false
        ]);
        break;
}

/**
 * 處理 get-user-type 請求
 * 
 * 前端請求：
 * - 方法：POS
 * - 參數：無（用戶ID從 session 中獲取）
 * 
 * 後端回應：
 * - 成功：
 *   {
 *     "message": "查詢成功",
 *     "success": true,
 *     "type": "用戶稱號" // 根據 '推薦類型' 對應的稱號
 *   }
 * - 用戶沒有測試紀錄：
 *   {
 *     "message": "用戶沒有測試紀錄",
 *     "success": false
 *   }
 * - 未找到用戶：
 *   {
 *     "message": "未找到用戶",
 *     "success": false
 *   }
 * - 伺服器錯誤：
 *   {
 *     "message": "伺服器錯誤，無法取得用戶稱號",
 *     "success": false
 *   }
 */
function handleGetUserType() {
    $userID = $_SESSION['userID'];
    try {
        // 假設 $link 是從 configure.php 包含的 PDO 連接
        global $link;
        
        $scheduleStmt = $link->prepare("
            SELECT `推薦類型` FROM `用戶` WHERE `用戶ID` = :userID
        ");
        $scheduleStmt->bindParam(':userID', $userID, PDO::PARAM_STR);
        $scheduleStmt->execute();

        if ($scheduleStmt->rowCount() > 0) {
            $user = $scheduleStmt->fetch(PDO::FETCH_ASSOC);
            $recommendationType = (int)$user['推薦類型'];

            if ($recommendationType === 0) {
                // 推薦類型為 0，表示用戶沒有測試紀錄
                http_response_code(200);
                echo json_encode([
                    "message" => "用戶沒有測試紀錄",
                    "success" => true,
                    "type" => null // 回傳 null 給前端
                ]);
                exit;
            }

            // 推薦類型不為 0，返回用戶稱號
            echo json_encode([
                "message" => "查詢成功",
                "success" => true,
                "type" => $user['推薦類型']
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                "message" => "未找到用戶",
                "success" => false
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "message" => "伺服器錯誤，無法取得用戶稱號",
            "success" => false
        ]);
    }
}

/**
 * 處理 save-user-type 請求
 * 
 * 前端請求：
 * - 方法：POST
 * - 參數：
 *   {
 *     "type": "推薦類型" // 字串，值為 "0" 或至少三位數的編碼（如 "111", "222", "333"）
 *   }
 * 
 * 後端回應：
 * - 成功更新推薦類型：
 *   {
 *     "message": "推薦類型更新成功",
 *     "success": true
 *   }
 * - 推薦類型未變更（新值與舊值相同）：
 *   {
 *     "message": "推薦類型未變更",
 *     "success": true
 *   }
 * - 缺少 type 參數：
 *   {
 *     "message": "缺少 type 參數",
 *     "success": false
 *   }
 * - 無效的 type 參數：
 *   {
 *     "message": "無效的 type 參數",
 *     "success": false
 *   }
 * - 伺服器錯誤：
 *   {
 *     "message": "伺服器錯誤，無法取得用戶稱號",
 *     "success": false
 *   }
 */
function handleSaveUserType($input) {
    $userID = $_SESSION['userID'];

    // 驗證是否提供了 'type' 參數
    if (!isset($input['type'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "缺少 type 參數",
            "success" => false
        ]);
        exit;
    }

    $type = $input['type'];

    // 驗證 type 的有效性
    // type 必須是字串，且只能是 "0" 或至少三位數的編碼（如 "111", "222", "333"）
    if (!is_string($type) || ($type !== "0" && !preg_match('/^\d{3,}$/', $type))) {
        http_response_code(400);
        echo json_encode([
            "message" => "無效的 type 參數",
            "success" => false
        ]);
        exit;
    }

    try {
        // 假設 $link 是從 configure.php 包含的 PDO 連接
        global $link;
        
        // 準備 SQL 查詢以更新推薦類型
        $updateStmt = $link->prepare("
            UPDATE `用戶` SET `推薦類型` = :type WHERE `用戶ID` = :userID
        ");
        $updateStmt->bindParam(':type', $type, PDO::PARAM_STR); // type 是字串
        $updateStmt->bindParam(':userID', $userID, PDO::PARAM_STR);
        $updateStmt->execute();

        // 檢查是否成功更新
        if ($updateStmt->rowCount() > 0) {
            echo json_encode([
                "message" => "推薦類型更新成功",
                "success" => true
            ]);
        } else {
            // 沒有更新任何行，可能是因為新值與舊值相同
            echo json_encode([
                "message" => "推薦類型未變更",
                "success" => true
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "message" => "伺服器錯誤，無法取得用戶稱號",
            "success" => false
        ]);
    }
}

/**
 * 處理 get-recommended-courses 請求
 * 
 * 前端請求：
 * - 方法：POST
 * - 參數：
 *   {
 *     "type": "推薦類型" // 字串，必須為三位數的編碼（如 "111", "222", "333"）
 *   }
 * 
 * 後端回應：
 * - 成功獲取課程：
 *   {
 *     "message": "查詢成功",
 *     "success": true,
 *     "recommendation": [ 
 *         {
 *             // 課程相關資料
 *             "編號": "...",
 *             "課名": "...",
 *             // 其他欄位
 *         },
 *         // 更多課程
 *     ]
 *   }
 * - 沒有找到相關課程：
 *   {
 *     "message": "沒有找到相關課程",
 *     "success": false
 *   }
 * - 缺少或格式錯誤的 type 參數：
 *   {
 *     "message": "缺少 type 參數" 或 "type 參數格式錯誤",
 *     "success": false
 *   }
 * - type 參數包含無效的回答：
 *   {
 *     "message": "type 參數包含無效的回答",
 *     "success": false
 *   }
 * - 無效的班級代碼：
 *   {
 *     "message": "無效的班級代碼",
 *     "success": false
 *   }
 * - 伺服器錯誤：
 *   {
 *     "message": "伺服器錯誤，無法取得選修課程",
 *     "success": false
 *   }
 */
function handleGetRecommendedCourses($input) {
    $userID = $_SESSION['userID'];

    // 驗證是否提供了 'type' 參數
    if (!isset($input['type'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "缺少 type 參數",
            "success" => false
        ]);
        exit;
    }

    $type = trim($input['type']);

    // 驗證 type 的格式
    if (!preg_match('/^\d{3}$/', $type)) {
        http_response_code(400);
        echo json_encode([
            "message" => "type 參數格式錯誤",
            "success" => false
        ]);
        exit;
    }

    // 解析 type 為 Q1, Q2, Q3 的回答
    $q1 = substr($type, 0, 1);
    $q2 = substr($type, 1, 1);
    $q3 = substr($type, 2, 1);

    // 定義問題回答的映射
    $q1Options = [
        '1' => '本系選修',
        '2' => '外系選修',
        '3' => '通識必修',
        '4' => '通識選修'
    ];

    $q2Options = [
        '1' => '火辣辣的熱門課程',
        '2' => '較佳的師生比',
        '3' => '隨意'
    ];

    $q3Options = [
        '1' => '早上',
        '2' => '下午',
        '3' => '晚上'
    ];

    // 驗證每個問題的回答是否有效
    if (!isset($q1Options[$q1]) || !isset($q2Options[$q2]) || !isset($q3Options[$q3])) {
        http_response_code(400);
        echo json_encode([
            "message" => "type 參數包含無效的回答",
            "success" => false
        ]);
        exit;
    }

    include("utils.php"); // 載入工具函數
    
    // 計算學年度和學期
    $academicYear = getAcademicYearAndSemester();

    // 提取系所代碼和班級代碼
    $departmentCode = substr($userID, 2, 4); // 第3到第6位為系所代碼
    $departmentCode .= '0'; 
    $classCode = substr($userID, 6, 1);      // 第7位為班級

    // 定義班級數字與字母的映射
    $classMapping = [
        '1' => 'A',
        '2' => 'B',
        '3' => 'C',
        '4' => 'D',
        '5' => 'E'
    ];

    // 檢查是否有對應的班級字母
    if (array_key_exists($classCode, $classMapping)) {
        $classLetter = $classMapping[$classCode];
    } else {
        // 如果班級代碼不在映射範圍內
        http_response_code(400);
        echo json_encode([
            "message" => "無效的班級代碼",
            "success" => false
        ]);
        exit;
    }

    // 計算學生年級
    $gradeLevel = calculateGradeLevel($userID);
    $sqlParams = [
        ':userID' => $userID,
        ':gradeLevel' => $gradeLevel,
        ':academicYear' => $academicYear
    ];
    $sqlParams[':departmentCode'] = $departmentCode;

    // 映射回答到 SQL 條件
    $sqlConditions[] = "k.`年級` < :gradeLevel";
    $sqlConditions[] = "k.`學期` = :academicYear";

    // 根據 Q1 的回答添加條件
    switch ($q1) {
        case '1': // 本系選修
            $sqlConditions[] = "k.`課別名稱` = '專業選修(系所)'";
            $sqlConditions[] = "k.`系所代碼` != :departmentCode";
            break;
        case '2': // 外系選修
            $sqlConditions[] = "k.`課別名稱` = '專業選修(系所)'";
            $sqlConditions[] = "k.`系所代碼` != :departmentCode";
            $sqlConditions[] = "k.`課表備註` LIKE '%外系%'";
            $sqlConditions[] = "k.`課表備註` LIKE '%修課限制%'";
            break;
        case '3': // 通識必修
            $sqlConditions[] = "k.`課別名稱` = '通識必修(通識)'";
            $sqlConditions[] = "k.`系所代碼` != :departmentCode";
            break;
        case '4': // 通識選修
            $sqlConditions[] = "k.`課別名稱` = '通識選修(通識)'";
            $sqlConditions[] = "k.`系所代碼` != :departmentCode";
            break;
    }

    // 根據 Q2 的回答添加條件
    switch ($q2) {
        case '1': // 火辣辣的熱門課程
            $sqlConditions[] = "k.`上課人數` >= 30";
            break;
        case '2': // 較佳的師生比
            $sqlConditions[] = "k.`上課人數` >= 10";
            $sqlConditions[] = "k.`上課人數` <= 30";
            break;
        case '3': // 隨意
            // 無額外條件
            break;
    }

    // 根據 Q3 的回答添加條件
    switch ($q3) {
        case '1': // 早上
            $sqlConditions[] = "k.`上課節次` IN (1, 2, 3, 4)";
            break;
        case '2': // 下午
            $sqlConditions[] = "k.`上課節次` IN (5, 6, 7, 8, 9, 10)";
            break;
        case '3': // 晚上
            $sqlConditions[] = "k.`上課節次` IN (11, 12, 13, 14)";
            break;
    }

    // 構建完整的 SQL 查詢
    $sql = "
        SELECT k.*,
            CASE 
                WHEN k.`上課星期` = '1' THEN '星期一'
                WHEN k.`上課星期` = '2' THEN '星期二'
                WHEN k.`上課星期` = '3' THEN '星期三'
                WHEN k.`上課星期` = '4' THEN '星期四'
                WHEN k.`上課星期` = '5' THEN '星期五'
                WHEN k.`上課星期` = '6' THEN '星期六'
                WHEN k.`上課星期` = '7' THEN '星期日'
                ELSE '未知'
            END AS `上課星期中文`,
            p.`評價文本`, 
            p.`評價時間`, 
            d.`系所名稱`,
            CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM `用戶收藏` u 
                    WHERE u.`用戶ID` = :userID AND u.`課程ID` = k.`編號`
                ) THEN 1
                ELSE 0
            END AS `mark`
        FROM `課程` k
        LEFT JOIN `課程評價` p ON k.`編號` = p.`課程ID`
        LEFT JOIN `系所對照表` d ON k.`系所代碼` = d.`系所代碼`
        WHERE " . implode(' AND ', $sqlConditions) . "
    ";

    try {
        // 假設 $link 是從 configure.php 包含的 PDO 連接
        global $link;
        $stmt = $link->prepare($sql);

        // 綁定所有參數
        foreach ($sqlParams as $param => $value) {
            $stmt->bindValue($param, $value, PDO::PARAM_STR);
        }

        // Debug: 輸出構建的 SQL 查詢與綁定參數
        // echo "構建的 SQL 查詢:\n";
        // echo $sql . "\n";

        // echo "綁定的參數:\n";
        // var_dump($sqlParams);
        // $scheduleStmt->bindParam(':academicYear', $academicYear, PDO::PARAM_STR);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode([
                "message" => "查詢成功",
                "success" => true,
                "recommendation" => $courses
            ]);
        } else {
            echo json_encode([
                "message" => "沒有找到相關課程",
                "success" => false
            ]);
        }
    } catch (Exception $e) {
        // 錯誤處理：在生產環境中不要暴露具體錯誤
        http_response_code(500);
        echo json_encode([
            "message" => "伺服器錯誤，無法取得選修課程",
            "success" => false
        ]);
    }
}
?>
