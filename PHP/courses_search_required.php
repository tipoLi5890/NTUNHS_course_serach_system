<?php
// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173'); // 指定允許的來源
header('Content-Type: application/json'); // 指定回應格式為 JSON
header('Access-Control-Allow-Methods: POST, OPTIONS'); // 設定允許的 HTTP 方法
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); // 設定允許的請求標頭
header('Access-Control-Allow-Credentials: true'); // 啟用 Cookie 傳遞

// 檢查是否為 OPTIONS 預檢請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // 返回 200 狀態碼，表明預檢成功
    exit;
}

session_start(); // 初始化 Session
include("configure.php");

if (isset($_COOKIE['sessionToken']) && isset($_SESSION['sessionToken'])) {
    if ($_COOKIE['sessionToken'] === $_SESSION['sessionToken']) {
        // 驗證成功，可以進一步處理請求

        if(isset($_SESSION['userID'])){
            $userID = $_SESSION['userID'];  // 取得用戶ID
            try {
                $studentNumber = $userID;
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


                // 從學號中提取學年、系所代碼和班級
                $departmentCode = substr($studentNumber, 2, 4); // 第3到第6位為系所代碼
                $departmentCode .= '0'; 
                $classCode = substr($studentNumber, 6, 1);      // 第7位為班級

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
                $currentAcademicYear = 113; // 想象當前學年為 113
                $gradeLevel = $currentAcademicYear - (int)('1'.substr($studentNumber, 0, 2))+1; // 計算年級
                if ($gradeLevel <= 0) {
                    $gradeLevel = 1; // 如果計算結果對不上，導致第一年級
                }
                // 查詢該班級的課表
                $scheduleStmt = $link->prepare("
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
                    LEFT JOIN 系所對照表 d ON k.系所代碼 = d.系所代碼
                    WHERE k.系所代碼 = :departmentCode
                    AND k.年級 = :gradeLevel
                    AND k.上課班組 = :classCode
                    AND k.`學期` = :academicYear
                ");
                
                // 綁定參數
                $scheduleStmt->bindParam(':userID', $userID, PDO::PARAM_STR);
                $scheduleStmt->bindParam(':departmentCode', $departmentCode, PDO::PARAM_STR);
                $scheduleStmt->bindParam(':gradeLevel', $gradeLevel, PDO::PARAM_STR);
                $scheduleStmt->bindParam(':classCode', $classLetter, PDO::PARAM_STR);
                $scheduleStmt->bindParam(':academicYear', $academicYear, PDO::PARAM_STR);
                
                // 執行查詢
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