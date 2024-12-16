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

        if(isset($_SESSION['用戶ID'])){
            $userId = $_SESSION['用戶ID'];  // 取得用戶ID

            
            try {
                $stmt = $link->prepare("SELECT 帳號 FROM 用戶 WHERE 用戶ID = :userId");
                $stmt->bindParam(':userId', $userId);
                $stmt->execute(); 

                //學號查找班級
                if ($stmt->rowCount() > 0) {
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                    $studentNumber = $user['帳號'];

                    // 從學號中提取學年、系所代碼和班級
                    $academicYear = substr($studentNumber, 0, 2); // 前兩位為學年
                    $academicYear = '1'.$academicYear;
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
                    $gradeLevel = $currentAcademicYear - (int)$academicYear+1; // 計算年級

                    if ($gradeLevel <= 0) {
                        $gradeLevel = 1; // 如果計算結果對不上，導致第一年級
                    }
                    // echo $academicYear;
                    // echo "\n";
                    // echo $departmentCode;
                    // echo "\n";
                    // echo $gradeLevel;
                    // echo "\n";
                    // echo $classLetter;
                    // echo "\n";
                    // 查詢該班級的課表
                    $scheduleStmt = $link->prepare("
                        SELECT k.*, p.評價文本, p.評價時間
                        FROM 課程 k
                        LEFT JOIN 課程評價 p ON k.編號 = p.課程ID
                        WHERE k.系所代碼 = :departmentCode
                        AND k.年級 = :gradeLevel
                        AND k.上課班組 = :classCode
                    ");
                    $scheduleStmt->bindParam(':departmentCode', $departmentCode);
                    $scheduleStmt->bindParam(':gradeLevel', $gradeLevel);
                    $scheduleStmt->bindParam(':classCode', $classLetter);
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
                } else {
                    // 如果用戶沒有找到對應的學號
                    http_response_code(404);
                    echo json_encode([
                        "message" => "找不到用戶的學號",
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