<?php
// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173'); // 根據需要調整
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); // 允許的 HTTP 方法
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // 允許的標頭
header('Access-Control-Allow-Credentials: true'); // 啟用 Cookie 傳遞

session_start(); // 初始化 Session
include("configure.php"); // 包含資料庫配置

// 處理 OPTIONS 請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 獲取前端傳入的 JSON 資料（適用於 POST 請求）
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
$action = isset($input['action']) ? $input['action'] : '';

if (empty($action)) {
    http_response_code(400);
    echo json_encode([
        "message" => "缺少 action 參數",
        "success" => false
    ]);
    exit;
}

// 檢查 Session Token
if (isset($_COOKIE['sessionToken']) && isset($_SESSION['sessionToken'])) {
    if ($_COOKIE['sessionToken'] !== $_SESSION['sessionToken']) {
        // 驗證失敗，返回未授權狀態
        http_response_code(401);
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
        "success" => false
    ]);
    exit;
}

// 根據 action 執行不同的功能
switch ($action) {
    case 'get-history-courses':
        getHistoryCourses($link);
        break;
    case 'get-user-record':
        getUserRecords($link);
        break;
    case 'get-course-record':
        getCourseRecords($link);
        break;
    case 'submit-comment':
        submitComment($link);
        break;
    default:
        http_response_code(400);
        echo json_encode(["error" => "未知的請求"]);
}

// 取得使用者的歷史課程
function getHistoryCourses($link)
{
    // 從 GET 參數中獲取 userID
    $userID = $_SESSION['userID']; // 取得用戶ID

    if (empty($userID)) {
        http_response_code(400);
        echo json_encode([
            "message" => "缺少參數 userID",
            "success" => false
        ]);
        exit;
    }

    // SQL 查詢使用者的歷史課程
    $query = "
        SELECT 
            c.編號 AS id,
            c.科目中文名稱 AS course,
            CONCAT(
                CASE c.上課星期
                    WHEN 1 THEN '星期一'
                    WHEN 2 THEN '星期二'
                    WHEN 3 THEN '星期三'
                    WHEN 4 THEN '星期四'
                    WHEN 5 THEN '星期五'
                    WHEN 6 THEN '星期六'
                    WHEN 7 THEN '星期日'
                    ELSE '未知'
                END,
                ' ',
                CAST(SUBSTRING_INDEX(c.上課節次, ',', 1) AS UNSIGNED), -- 起始節次
                '~',
                CAST(SUBSTRING_INDEX(c.上課節次, ',', -1) AS UNSIGNED) -- 結束節次               
            ) AS time,
            c.學分數 AS credits,
            COALESCE(NULLIF(TRIM(c.上課地點), ''), '地點暫無') AS room,  -- 使用 TRIM() 和 NULLIF() 處理空字符串
            c.主開課教師姓名 AS teacherM,
            CONCAT(d.系所名稱,
                CASE c.年級 
                    WHEN 1 THEN '一年級'
                    WHEN 2 THEN '二年級'
                    WHEN 3 THEN '三年級'
                    WHEN 4 THEN '四年級'
                    ELSE '年級未知'
                END) AS belongs
        FROM 歷史修課紀錄 h
        JOIN 課程 c ON h.課程ID = c.編號
        JOIN 系所對照表 d ON c.系所代碼 = d.系所代碼
        WHERE h.用戶ID = :userID
    ";

    try {
        $stmt = $link->prepare($query);
        $stmt->bindParam(':userID', $userID, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 檢查查詢結果是否有資料
        if ($result) {
            $history = [];
            foreach ($result as $row) {
                $history[] = [
                    "id" => $row["id"],
                    "course" => $row["course"],
                    "time" => $row["time"],
                    "credits" => intval($row["credits"]),
                    "room" => $row["room"],
                    "teacherM" => $row["teacherM"],
                    "belongs" => $row["belongs"],
                ];
            }

            echo json_encode([
                "message" => "歷史課程查詢成功",
                "success" => true,
                "history" => $history
            ]);
        } else {
            // 如果沒有歷史課程資料
            echo json_encode([
                "message" => "未找到歷史課程資料",
                "success" => false
            ]);
        }
    } catch (Exception $e) {
        // 查詢出現錯誤
        http_response_code(500);
        echo json_encode([
            "message" => "伺服器錯誤，無法查詢歷史課程",
            "success" => false
        ]);
    }
}

// 取得使用者的評論記錄
function getUserRecords($link)
{
    // 從 GET 參數中獲取 userID
    $userID = $_SESSION['userID']; // 取得用戶ID

    if (empty($userID)) {
        http_response_code(400);
        echo json_encode([
            "message" => "缺少參數 userID",
            "success" => false
        ]);
        exit;
    }

    // SQL 查詢使用者的評論
    $query = "
        SELECT 
            r.課程ID AS id,
            c.學期 AS term,
            c.科目中文名稱 AS course,
            CASE r.評論狀態
                WHEN 'Y' THEN 1
                WHEN 'N' THEN 0
                ELSE NULL
            END AS isCommend,
            r.評價文本 AS comment,
            r.評價時間 AS reviewDate,
            CASE r.評論狀態
                WHEN 'L' THEN 1
                ELSE 0
            END AS `lock`  -- 使用反引號引用保留字
        FROM 課程評價 r
        JOIN 課程 c ON r.課程ID = c.編號
        WHERE r.用戶ID = :userID
    ";

    try {
        $stmt = $link->prepare($query);
        $stmt->bindParam(':userID', $userID, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 返回處理後的結果
        echo json_encode([
            "message" => "評論記錄查詢成功",
            "success" => true,
            "record" => $result
        ]);
    } catch (Exception $e) {
        // 查詢出現錯誤
        http_response_code(500);
        echo json_encode([
            "message" => "伺服器錯誤，無法查詢評論記錄",
            "success" => false
        ]);
    }
}


// 取得某課程的評論內容
function getCourseRecords($link)
{
    $userID = $_SESSION['userID']; // 取得用戶ID
    $inputData = json_decode(file_get_contents('php://input'), true); // 獲取前端傳送的JSON數據

    // 記錄請求資料到日誌，便於調試
    error_log('接收到的請求：' . print_r($inputData, true));

    $id = $inputData['id'] ?? null; // 從 JSON 數據中獲取課程 ID

    // 驗證必要參數
    if (empty($userID) || empty($id)) {
        http_response_code(400);
        echo json_encode(["error" => "缺少必要參數", "success" => false]);
        return;
    }

    // 定義 SQL 查詢特定課程的評論
    $query = "
        SELECT 
            課程評價.課程ID AS id,
            CONCAT(系所對照表.系所名稱, ' ', 
                CASE 課程.年級
                    WHEN 1 THEN '一年級'
                    WHEN 2 THEN '二年級'
                    WHEN 3 THEN '三年級'
                    WHEN 4 THEN '四年級'
                    ELSE '年級未知'
                END
            ) AS creater,
            課程評價.評價文本 AS comment,
            課程評價.評價時間 AS reviewDate
        FROM 課程評價
        JOIN 課程 ON 課程評價.課程ID = 課程.編號
        JOIN 系所對照表 ON 課程.系所代碼 = 系所對照表.系所代碼
        WHERE 課程評價.課程ID = :id
    ";

    try {
        // 預處理查詢
        $stmt = $link->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);

        // 執行查詢
        if ($stmt->execute()) {
            // 抓取查詢結果
            $courseRecord = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($courseRecord)) {
                // 返回成功響應
                echo json_encode([
                    "message" => "課程評論查詢成功",
                    "success" => true,
                    "courseRecord" => $courseRecord
                ], JSON_UNESCAPED_UNICODE);
            } else {
                // 如果沒有該課程的評論
                echo json_encode([
                    "message" => "未找到該課程的評論",
                    "success" => false
                ]);
            }
        } else {
            throw new Exception("SQL 執行失敗");
        }
    } catch (PDOException $e) {
        // 捕捉資料庫錯誤
        error_log('資料庫錯誤：' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            "message" => "資料庫錯誤，無法查詢課程評論",
            "success" => false
        ]);
    } catch (Exception $e) {
        // 捕捉其他錯誤
        error_log('錯誤訊息：' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            "message" => "伺服器錯誤，無法查詢課程評論",
            "success" => false
        ]);
    }
}



// 學生提交評論
function submitComment($link)
{
    // 確保請求方法為 POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405); // Method Not Allowed
        echo json_encode([
            "message" => "不支援的 HTTP 方法",
            "success" => false
        ]);
        exit;
    }

    // 從 JSON 中取得參數
    global $input;
    $id = isset($input['id']) ? trim($input['id']) : '';
    $userID = $_SESSION['userID']; // 取得用戶ID
    $comment = isset($input['comment']) ? trim($input['comment']) : '';

    // 檢查是否有必要參數
    if (empty($id) || empty($userID) || empty($comment)) {
        http_response_code(400);
        echo json_encode([
            "message" => "缺少必要參數",
            "success" => false
        ]);
        exit;
    }

    // 更新評論的 SQL 查詢，將評論狀態設為 'Y'
    $query = "UPDATE 課程評價 SET 評價文本 = :comment, 評論狀態 = 'Y' WHERE 課程ID = :id AND 用戶ID = :userID";

    try {
        $stmt = $link->prepare($query);
        $stmt->bindParam(':comment', $comment, PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, PDO::PARAM_STR);
        $stmt->bindParam(':userID', $userID, PDO::PARAM_STR);

        if ($stmt->execute()) {
            // 查詢更新後的資料，聯結課程表來取得學期和課程名稱
            $selectQuery = "
                SELECT 
                    r.課程ID AS id,
                    c.學期 AS term,
                    c.科目中文名稱 AS course,
                    CASE r.評論狀態
                        WHEN 'Y' THEN 1
                        ELSE 0
                    END AS isCommend,
                    r.評價文本 AS comment,
                    r.評價時間 AS reviewDate,
                    CASE r.評論狀態
                        WHEN 'L' THEN 1
                        ELSE 0
                    END AS `lock`  -- 使用反引號引用保留字
                FROM 課程評價 r
                JOIN 課程 c ON r.課程ID = c.編號
                WHERE r.課程ID = :id AND r.用戶ID = :userID
            ";

            $selectStmt = $link->prepare($selectQuery);
            $selectStmt->bindParam(':id', $id, PDO::PARAM_STR);
            $selectStmt->bindParam(':userID', $userID, PDO::PARAM_STR);
            $selectStmt->execute();
            $result = $selectStmt->fetch(PDO::FETCH_ASSOC);

            // 返回成功信息和更新後的記錄
            echo json_encode([
                "message" => "評論更新成功",
                "success" => true,
                "updatedRecord" => $result
            ]);
        } else {
            // 如果 SQL 執行失敗，返回 500 錯誤
            http_response_code(500);
            echo json_encode([
                "message" => "評論提交失敗",
                "success" => false
            ]);
        }
    } catch (Exception $e) {
        // 查詢出現錯誤
        http_response_code(500);
        echo json_encode([
            "message" => "伺服器錯誤，無法提交評論",
            "success" => false
        ]);
    }
}
?>