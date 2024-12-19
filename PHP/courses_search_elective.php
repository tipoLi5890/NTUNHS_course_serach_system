<?php
// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); // 添加 GET 方法
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // 添加 Authorization 標頭
header('Access-Control-Allow-Credentials: true'); // 啟用 Cookie 傳遞

session_start(); // 初始化 Session
include("configure.php");

if (isset($_COOKIE['sessionToken']) && isset($_SESSION['sessionToken'])) {
    if ($_COOKIE['sessionToken'] === $_SESSION['sessionToken']) {
        // 驗證成功，可以進一步處理請求

        if(isset($_SESSION['userID'])){
            $userId = $_SESSION['userID'];  // 取得用戶ID
            
            try {
                $studentNumber = $userId;
                // 從學號中提取學年、系所代碼和班級
                $academicYear = substr($studentNumber, 0, 2); // 前兩位為學年
                $academicYear = '1'.$academicYear;
                $departmentCode = substr($studentNumber, 2, 4); // 第3到第6位為系所代碼
                $departmentCode .= '0'; 

                // 計算學生年級
                $currentAcademicYear = 113; // 想象當前學年為 113
                $gradeLevel = $currentAcademicYear - (int)$academicYear+1; // 計算年級

                if ($gradeLevel <= 0) {
                    $gradeLevel = 1; // 如果計算結果對不上，導致第一年級
                }

                // 查詢該班級的課表
                $scheduleStmt = $link->prepare("
                    SELECT 
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
                    FROM 課程 k
                    LEFT JOIN 課程評價 p 
                        ON k.編號 = p.課程ID
                    LEFT JOIN 系所對照表 d 
                        ON k.系所代碼 = d.系所代碼
                    WHERE k.系所代碼 = :departmentCode
                    AND k.年級 <= :gradeLevel
                    AND (k.課別名稱 = '專業選修(系所)' OR k.課別名稱 = '通識選修(通識)');
                ");
                $scheduleStmt->bindParam(':userID', $userID, PDO::PARAM_STR);
                $scheduleStmt->bindParam(':departmentCode', $departmentCode);
                $scheduleStmt->bindParam(':gradeLevel', $gradeLevel);
                $scheduleStmt->execute();

                // 檢查是否有課程資料
                if ($scheduleStmt->rowCount() > 0) {
                    $courses = $scheduleStmt->fetchAll(PDO::FETCH_ASSOC);
                    http_response_code(200);
                    // 回傳課程資料
                    echo "\n\n";
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