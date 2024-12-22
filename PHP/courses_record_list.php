<?php
/**
 * 處理 get-course-record 請求
 * 
 * 此 PHP 程式用於處理前端發送的「取得歷史紀錄記錄」請求。根據提供的課程 ID，從資料庫中查詢相關的歷史紀錄資料並回傳給前端。
 * 
 * 前端請求：
 * - 方法： POST
 * - 標頭：
 *   - Content-Type: application/json
 * - 參數： action 和 id（課程ID）
 *   ```json
 *   {
 *     "action": "get-course-record",
 *     "id": "{CourseID}"
 *   }
 *   ```
 * 
 * 後端回應：
 * - 成功：
 *   ```json
 *   {
 *     "message": "查詢成功",
 *     "success": true,
 *     "courses": [
 *       {
 *         "評價ID": "評價1的ID",
 *         "課程ID": "COURSE12345",
 *         "評價文本": "這門課程非常有幫助！",
 *         "評價時間": "2024-04-01 10:30:00"
 *       },
 *       {
 *         "評價ID": "評價2的ID",
 *         "課程ID": "COURSE12345",
 *         "評價文本": "講師講解清楚，內容豐富。",
 *         "評價時間": "2024-04-02 14:15:00"
 *       }
 *       // ...更多評價
 *     ]
 *   }
 *   ```
 * - 錯誤回應：
 *   - 無效的 JSON 格式：
 *     ```json
 *     {
 *       "message": "無效的 JSON 格式",
 *       "success": false
 *     }
 *     ```
 *   - 缺少必要的參數：
 *     ```json
 *     {
 *       "message": "缺少必要的參數",
 *       "success": false
 *     }
 *     ```
 *   - 非正確的 action 類型：
 *     ```json
 *     {
 *       "message": "非正確action類型",
 *       "success": false
 *     }
 *     ```
 *   - 沒有找到相關課程：
 *     ```json
 *     {
 *       "message": "沒有找到相關課程",
 *       "success": false
 *     }
 *     ```
 *   - 伺服器錯誤：
 *     ```json
 *     {
 *       "message": "伺服器錯誤，無法查詢課程",
 *       "success": false
 *     }
 *     ```
 *   - 未找到用戶ID，請重新登入：
 *     ```json
 *     {
 *       "message": "未找到用戶ID，請重新登入",
 *       "success": false
 *     }
 *     ```
 *   - 無效的 Session Token，請重新登入：
 *     ```json
 *     {
 *       "message": "無效的 Session Token，請重新登入",
 *       "success": false
 *     }
 *     ```
 *   - Session 過期或未登入：
 *     ```json
 *     {
 *       "message": "Session 過期或未登入",
 *       "success": false
 *     }
 *     ```
 */

// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173'); // 指定允許的來源
header('Content-Type: application/json'); // 指定回應格式為 JSON
header('Access-Control-Allow-Methods: POST, OPTIONS'); // 設定允許的 HTTP 方法
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // 設定允許的請求標頭
header('Access-Control-Allow-Credentials: true'); // 啟用 Cookie 傳遞

// 檢查是否為 OPTIONS 預檢請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // 返回 200 狀態碼，表明預檢成功
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
if (!isset($input['action']) || !isset($input['courseCode'])) {
    http_response_code(400);
    echo json_encode([
        "message" => "缺少必要的參數",
        "success" => false
    ]);
    exit;
}

if($input['action'] !== 'get-course-record'){
    http_response_code(400);
    echo json_encode([
        "message" => "非正確action類型",
        "success" => false
    ]);
    exit;
}

// 提取參數
$action = $input['action'];
$CourseID = $input['courseCode'];

session_start(); // 初始化 Session
include("configure.php");


if (isset($_COOKIE['sessionToken']) && isset($_SESSION['sessionToken'])) {
    if ($_COOKIE['sessionToken'] === $_SESSION['sessionToken']) {
        // 驗證成功，可以進一步處理請求

        if(isset($_SESSION['userID'])){
            $userID = $_SESSION['userID'];  // 取得用戶ID
            try {

                // 查詢該課程的評價
                $scheduleStmt = $link->prepare("
                    SELECT 
                        r.評價ID, 
                        r.課程ID, 
                        r.評價文本, 
                        r.評價時間 
                    FROM 歷史紀錄 AS r
                    JOIN 課程 AS c
                    ON r.課程ID = c.編號
                    WHERE c.科目代碼_新碼 = :CourseID
                    AND r.評價文本 != '' 
                    AND r.評論狀態 = 'Y' 
                ");
                
                // 綁定參數
                $scheduleStmt->bindParam(':CourseID', $CourseID, PDO::PARAM_STR);

                // 執行查詢
                $scheduleStmt->execute();

                // 檢查是否有課程資料
                if ($scheduleStmt->rowCount() > 0) {
                    $record_list = $scheduleStmt->fetchAll(PDO::FETCH_ASSOC);
                    http_response_code(200);
                    // 回傳課程資料
                    echo "\n\n";
                    echo json_encode([
                        "message" => "查詢成功",
                        "success" => true,
                        "courses" => $record_list
                    ]);
                } else {
                    // 如果沒有課程資料
                    echo json_encode([
                        "message" => "沒有找到相關課程",
                        "success" => true,
                        "courses" => [] // 確保 courses 是空陣列
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
        }else {
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
}else {
    // 沒有 Session Token，可能未登入或 Session 過期
    http_response_code(401);
    echo json_encode([
        "message" => "Session 過期或未登入",
        "success" => false,
    ]);
    exit;
}
?>