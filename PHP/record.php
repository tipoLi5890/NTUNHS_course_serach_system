<?php
// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); // 允許的 HTTP 方法
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true'); // 啟用 Cookie 傳遞

session_start(); // 初始化 Session
include("configure.php");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}

// 處理 API 請求
$action = $_GET['action'] ?? '';

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
    $userID = $_GET['userID'] ?? '';

    if (empty($userID)) {
        http_response_code(400);
        echo json_encode(["error" => "缺少參數 userID"]);
        return;
    }

    // 範例查詢資料的 SQL，根據測試結果調整查詢結構
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
                c.上課節次
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
        WHERE h.用戶ID = ?
    ";

    $stmt = $link->prepare($query);
    $stmt->bindParam(1, $userID, PDO::PARAM_STR);  
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 檢查查詢結果是否有資料
    if ($result) {
        $history = [];
        foreach ($result as $row) {
            $history[] = [
                "id" => strval($row["id"]),
                "course" => $row["course"],
                "time" => $row["time"],
                "credits" => intval($row["credits"]),
                "room" => $row["room"],
                "teacherM" => $row["teacherM"],
                "belongs" => $row["belongs"],
            ];
        }

        echo json_encode(["history" => $history]);
    } else {
        echo json_encode(["message" => "未找到歷史課程資料", "success" => false]);
    }
}

// 取得使用者的評論
function getUserRecords($link)
{
    $userID = $_GET['userID'] ?? '';

    if (empty($userID)) {
        http_response_code(400);
        echo json_encode(["error" => "缺少參數 userID"]);
        return;
    }

    // SQL 查詢，聯結 課程資料表 和 評論記錄表
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
        WHERE r.用戶ID = ?
    ";

    $stmt = $link->prepare($query);
    $stmt->bindParam(1, $userID, PDO::PARAM_STR);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 返回處理後的結果
    echo json_encode(["record" => $result]);
}

// 取得某課程的評論內容
function getCourseRecords($link)
{
    $id = $_GET['id'] ?? '';

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["error" => "缺少參數 id"]);
        return;
    }

    $query = "
        SELECT 
            r.課程ID AS id,
            c.科目中文名稱 AS course,
            r.評價文本 AS comment,
            r.評價時間 AS reviewDate,
            CONCAT(d.系所名稱, ' ', r.年級) AS creater  -- 組合系所名稱和年級作為評論者
        FROM 評論記錄 r
        JOIN 課程 c ON r.課程ID = c.編號
        JOIN 系所對照表 d ON c.系所代碼 = d.系所代碼
        WHERE r.課程ID = ?
    ";
    
    $stmt = $link->prepare($query);
    $stmt->bindParam(1, $id, PDO::PARAM_STR);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($result) {
        $courseRecord = [];
        foreach ($result as $row) {
            $courseRecord[] = [
                "id" => strval($row["id"]),   // 確保 ID 是字串
                "creater" => $row["creater"],
                "comment" => $row["comment"],
                "reviewDate" => $row["reviewDate"]
            ];
        }

        echo json_encode(["courseRecord" => $courseRecord]);
    } else {
        echo json_encode(["message" => "未找到該課程的評論", "success" => false]);
    }
}

// 學生提交評論
function submitComment($link)
{
    // 檢查請求方法
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        // 使用 POST 請求，讀取 JSON 格式的數據
        $data = json_decode(file_get_contents("php://input"), true);

        // 從 JSON 中取得參數
        $id = $data['id'] ?? '';
        $userID = $data['userID'] ?? '';
        $comment = $data['comment'] ?? '';
    } else {
        // 其他方法不支援
        http_response_code(405); // Method Not Allowed
        echo json_encode(["error" => "不支援的 HTTP 方法"]);
        return;
    }

    // 檢查是否有必要參數
    if (empty($id) || empty($userID) || empty($comment)) {
        http_response_code(400);
        echo json_encode(["error" => "缺少必要參數"]);
        return;
    }

    // 更新評論的 SQL 查詢，將評論狀態設為 'Y'
    $query = "UPDATE 課程評價 SET 評價文本 = ?, 評論狀態 = 'Y' WHERE 課程ID = ? AND 用戶ID = ?";
    $stmt = $link->prepare($query);
    $stmt->bindParam(1, $comment, PDO::PARAM_STR);
    $stmt->bindParam(2, $id, PDO::PARAM_STR);
    $stmt->bindParam(3, $userID, PDO::PARAM_STR);

    if ($stmt->execute()) {
        // 查詢更新後的資料，聯結課程表來取得學期和課程名稱
        $query = "
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
            WHERE r.課程ID = ? AND r.用戶ID = ?
        ";
        $stmt = $link->prepare($query);
        $stmt->bindParam(1, $id, PDO::PARAM_STR);
        $stmt->bindParam(2, $userID, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        // 返回成功信息和更新後的記錄
        echo json_encode([
            "message" => "評論更新成功",
            "updatedRecord" => $result
        ]);
    } else {
        // 如果 SQL 執行失敗，返回 500 錯誤
        http_response_code(500);
        echo json_encode(["error" => "評論提交失敗"]);
    }
}
