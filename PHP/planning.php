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

$inputData = json_decode(file_get_contents('php://input'), true); // 獲取前端傳送的JSON數據 

if (!isset($inputData['action'])) {
    // 缺少參數
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "缺少必要參數。"
    ]);
}

// 處理 API 請求
$action = $inputData['action'];

switch ($action) {
    case 'get-saved-required'://1. 取得使用者專業必修 
        getSavedRequiredCourses($link);
        break;
    case 'get-saved-elective': //2. 取得使用者已儲存的其他課程 ok
        getSavedElectiveCourses($link);
        break;
    case 'update-course-visibility'://3. 更新課程的顯示/隱藏狀態 ok
        updateCourseVisibility($link);
        break;
    case 'get-saved-detail':
        savedCourseDetail($link);
        break;
    default:
        http_response_code(400);
        echo json_encode(["error" => "未知的請求"]);
}

//1. 取得使用者專業必修 && 通識必修
function getSavedRequiredCourses($link)
{
    // 檢查 Session 和 Cookie 是否有效
    if (isset($_COOKIE['sessionToken'], $_SESSION['sessionToken']) && $_COOKIE['sessionToken'] === $_SESSION['sessionToken']) {
        if (isset($_SESSION['userID'])) {
            $userID = $_SESSION['userID']; // 取得用戶 ID

            try {
                // 查找用戶帳號（學號）
                $stmt = $link->prepare("SELECT 帳號 FROM 用戶 WHERE 用戶ID = :userID");
                $stmt->bindParam(':userID', $userID, PDO::PARAM_INT);
                $stmt->execute();

                if ($stmt->rowCount() > 0) {
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                    $studentNumber = $user['帳號'];

                    // 從學號中提取學年、系所代碼和班級
                    $academicYear = '1' . substr($studentNumber, 0, 2);
                    $departmentCode = substr($studentNumber, 2, 4) . '0';
                    $classCode = substr($studentNumber, 6, 1);

                    // 定義班級數字與字母的映射
                    $classMapping = [
                        '1' => 'A',
                        '2' => 'B',
                        '3' => 'C',
                        '4' => 'D',
                        '5' => 'E',
                    ];

                    if (!isset($classMapping[$classCode])) {
                        http_response_code(400);
                        echo json_encode(["message" => "無效的班級代碼", "success" => false]);
                        exit;
                    }

                    $classLetter = $classMapping[$classCode];
                    $currentAcademicYear = 113; // 當前學年
                    
                    $gradeLevel = max(1, $currentAcademicYear - (int)$academicYear + 1); // 計算年級

                    // 初始化返回的必修課程清單
                    $savedRequired = [];

                    // 從當前年級往前逐年查詢課程
                    for ($year = $gradeLevel; $year >= 1; $year--) { //4 3 2 1
                        // 計算對應的學年和學期
                        $targetSemesterCode = 1131 - ($gradeLevel -  $year) * 10; 

                        // 查詢課程
                        $query = "
                            SELECT DISTINCT  
                                課程.編號 AS id, 
                                1 AS mark, 
                                課程.科目中文名稱 AS courseName, 
                                CAST(SUBSTRING_INDEX(課程.上課節次, ',', 1) AS INT) AS startPeriod, -- 起始節次
                                CAST(SUBSTRING_INDEX(課程.上課節次, ',', -1) AS INT) AS endPeriod, -- 結束節次
                                CAST(課程.上課星期 AS INT) AS weekDay,
                                '0' AS category, 
                                '1' AS isPlaced, 
                                課程.學期 AS semester, 
                                CAST(課程.學分數 AS INT) AS credits
                            FROM  
                                課程
                            WHERE  
                                (課程.課別名稱 LIKE '%專業必修%' OR 課程.課別名稱 LIKE '%通識必修%') -- 篩選專業必修課程
                                AND 課程.系所代碼 = :departmentCode
                                AND 課程.年級 = :year
                                AND SUBSTRING(課程.科目代碼_新碼, -2, 1) = :classCode
                                AND 課程.學期 = :targetSemesterCode -- 使用學期代碼
                        ";

                        $courseStmt = $link->prepare($query);       
                        $courseStmt->bindParam(':departmentCode', $departmentCode, PDO::PARAM_STR);
                        $courseStmt->bindParam(':year', $year, PDO::PARAM_INT);
                        $courseStmt->bindParam(':classCode', $classLetter, PDO::PARAM_STR);
                        $courseStmt->bindParam(':targetSemesterCode', $targetSemesterCode, PDO::PARAM_INT);

                        // 執行查詢
                        $courseStmt->execute();

                        // 合併查詢結果
                        $savedRequired = array_merge($savedRequired, $courseStmt->fetchAll(PDO::FETCH_ASSOC));
                    }

                    // 回傳結果
                    if (!empty($savedRequired)) {
                        http_response_code(200);
                        echo json_encode([
                            "success" => true,
                            "savedRequired" => $savedRequired
                        ], JSON_UNESCAPED_UNICODE);
                    } else {
                        http_response_code(200);
                        echo json_encode([
                            "message" => "沒有找到相關課程",
                            "success" => false
                        ]);
                    }
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "找不到用戶的學號", "success" => false]);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    "message" => "伺服器錯誤，無法查詢課程",
                    "success" => false,
                    "error" => $e->getMessage()
                ]);
            }
        } else {
            http_response_code(403);
            echo json_encode(["message" => "未找到用戶ID，請重新登入", "success" => false]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Session 過期或未登入", "success" => false]);
    }
}


//2. 取得使用者已儲存的課程
function getSavedElectiveCourses($link)
{
    // 獲取請求中的 userID
    $userID = $_SESSION['userID']; // 取得用戶ID
    // 定義 SQL 查詢
    $query = "
        SELECT  
            課程.編號 AS id, 
            1 AS mark, 
            課程.科目中文名稱 AS courseName, 
            CAST(SUBSTRING_INDEX(課程.上課節次, ',', 1) AS INT) AS startPeriod, -- 起始節次
            CAST(SUBSTRING_INDEX(課程.上課節次, ',', -1) AS INT) AS endPeriod, -- 結束節次
            CAST(課程.上課星期 AS INT) AS weekDay,
            1 AS category, 
            課程規劃.放置狀態 AS isPlaced,
            課程.學期 AS semester, 
            CAST(課程.學分數 AS INT) AS credits 
        FROM  
            課程規劃 
        JOIN  
            課程 ON 課程規劃.課程ID = 課程.編號 
        WHERE  
            課程規劃.用戶ID = :userID
    ";

    try {
        $stmt = $link->prepare($query); // 預處理查詢
        $stmt->bindParam(':userID', $userID, PDO::PARAM_INT); // 綁定用戶ID

        if ($stmt->execute()) { // 執行查詢
            // 抓取所有符合條件的課程
            $savedElective = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 回傳 JSON 格式的收藏選修課程
            echo json_encode([
                "success" => true,
                "savedElective" => $savedElective
            ], JSON_UNESCAPED_UNICODE);
        } else {
            // 如果執行失敗，回傳錯誤信息
            http_response_code(500);
            echo json_encode(["error" => "無法取得選修課程資料"], JSON_UNESCAPED_UNICODE);
        }
    } catch (PDOException $e) {
        // 捕捉資料庫例外，回傳伺服器錯誤信息
        http_response_code(500);
        echo json_encode(["error" => "伺服器錯誤: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}


/**
 * 3. 更新課程的顯示/隱藏狀態
 */
function updateCourseVisibility($link)
{
    $userID = $_SESSION['userID']; // 取得用戶ID
    $inputData = json_decode(file_get_contents('php://input'), true); // 獲取前端傳送的JSON數據 

    $id = $inputData['id'] ?? null; // 從 JSON 數據中獲取課程 ID
    $isPlaced = $inputData['isPlaced'] ?? null; // 從 JSON 數據中獲取顯示狀態

    // 驗證必要參數
    if (empty($userID) || empty($id) || !isset($isPlaced)) {
        http_response_code(400);
        echo json_encode(["error" => "缺少必要參數"]);
        return;
    }

    // 把 isPlaced 轉換為字串 ('0' 或 '1')
    $isPlaced = (string)$isPlaced;

    // 檢查 isPlaced 是否為有效的字串 '0' 或 '1'
    if ($isPlaced !== '0' && $isPlaced !== '1') {
        http_response_code(400);
        echo json_encode(["error" => "放置狀態無效，請傳送 '0' 或 '1'"]);
        return;
    }

    // 定義 SQL 查詢，檢查資料是否存在
    $checkQuery = "
        SELECT 1
        FROM 課程規劃
        WHERE 用戶ID = :userID AND 課程ID = :id
    ";

    try {
        // 檢查是否有對應的課程資料
        $checkStmt = $link->prepare($checkQuery);
        $checkStmt->bindParam(':userID', $userID, PDO::PARAM_INT);
        $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $checkStmt->execute();

        // 如果資料不存在，返回錯誤
        if ($checkStmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["error" => "找不到該課程資料"]);
            return;
        }

        // 定義 SQL 查詢，更新顯示狀態
        $updateQuery = "
            UPDATE 課程規劃
            SET 放置狀態 = :isPlaced
            WHERE 用戶ID = :userID AND 課程ID = :id
        ";

        $stmt = $link->prepare($updateQuery);
        $stmt->bindParam(':userID', $userID, PDO::PARAM_INT);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':isPlaced', $isPlaced, PDO::PARAM_STR);

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "課程顯示狀態更新成功",
                "updatedCourse" => [
                    "id" => $id,
                    "isPlaced" => $isPlaced
                ]
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "課程顯示狀態更新失敗"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "伺服器錯誤: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

/**
 * 4. 取得使用者已儲存的某課程詳細資訊
 */
function savedCourseDetail($link)
{
    $userID = $_SESSION['userID']; // 取得用戶ID
    $inputData = json_decode(file_get_contents('php://input'), true); // 獲取前端傳送的JSON數據 

    $id = $inputData['id'] ?? null; // 從 JSON 數據中獲取課程 ID

    $classCode = substr($userID, 6, 1);

    // 定義班級數字與字母的映射
    $classMapping = [
        '1' => 'A',
        '2' => 'B',
        '3' => 'C',
        '4' => 'D',
        '5' => 'E',
    ];

    if (!isset($classMapping[$classCode])) {
        http_response_code(400);
        echo json_encode(["message" => "無效的班級代碼", "success" => false]);
        exit;
    }

    $classLetter = $classMapping[$classCode];

    // 驗證必要參數
    if (empty($userID) || empty($id)) {
        http_response_code(400);
        echo json_encode(["error" => "缺少必要參數"]);
        return;
    }

// 定義 SQL 查詢，查詢該用戶已儲存的課程詳細資料
    $query = "
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
            d.系所名稱
        FROM 課程 k
        LEFT JOIN 系所對照表 d 
            ON k.系所代碼 = d.系所代碼
        WHERE k.編號 = :id;
    ";

    try {
        $stmt = $link->prepare($query); // 預處理查詢
        $stmt->bindParam(':id', $id, PDO::PARAM_INT); // 綁定課程ID

        if ($stmt->execute()) { // 執行查詢
            // 抓取該課程詳細資料
            $courseDetail = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($courseDetail) {
                // 回傳課程詳細資訊
                echo json_encode([
                    "success" => true,
                    "courseDetail" => $courseDetail
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "找不到該課程的詳細資料"]);
            }
        } else {
            // 查詢執行失敗
            http_response_code(500);
            echo json_encode(["error" => "無法取得課程詳細資料"]);
        }
    } catch (PDOException $e) {
        // 捕捉資料庫例外，回傳伺服器錯誤信息
        http_response_code(500);
        echo json_encode(["error" => "伺服器錯誤: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}
