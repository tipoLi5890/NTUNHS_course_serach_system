<?php 
// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); // 允許的 HTTP 方法
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true'); // 啟用 Cookie 傳遞

session_start(); // 初始化 Session
include("configure.php");

// 處理 OPTIONS 請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // No Content
    exit();
}

// 獲取前端傳入的 JSON 資料（適用於 POST 請求）
$inputData = json_decode(file_get_contents('php://input'), true);
if (!$inputData) {
    http_response_code(400);
    echo json_encode(["message" => "無效的請求格式", "success" => false]);
    exit;
}

// 確保 action 存在
$action = $inputData['action'] ?? '';

if (empty($action)) {
    http_response_code(400);
    echo json_encode([
        "message" => "缺少 action 參數",
        "success" => false
    ]);
    exit;
}

switch ($action) {
    case 'get-saved-required'://1. 取得使用者專業必修 ok
        getSavedRequiredCourses($link, $inputData);
        break;
    case 'get-saved-elective': //2. 取得使用者已儲存的其他課程 ok
        getSavedElectiveCourses($link, $inputData);
        break;
    case 'update-course-visibility'://3. 更新課程的顯示/隱藏狀態 ok
        updateCourseVisibility($link, $inputData);
        break;
    case 'update-course-mark'://4. 更新課程的收藏狀態 
        toggleCourseMark($link, $inputData);
        break;
    default:
        http_response_code(400);
        echo json_encode(["error" => "未知的請求"]);
}

/* getSavedRequiredCourses 回傳格式
    {
      "id": 410,
      "mark": 1,
      "courseName": "系統分析與設計",
      "startPeriod": 2,
      "endPeriod": 4,
      "weekDay": "5",
      "category": 0,
      "isPlaced": 1,
      "semester": "1131",
      "credits": "3.00"
    },
    {
      "id": 411,
      "mark": 1,
      "courseName": "研究概論",
      "startPeriod": 5,
      "endPeriod": 7,
      "weekDay": "2",
      "category": 0,
      "isPlaced": 1,
      "semester": "1131",
      "credits": "3.00"
    }
*/

// 定義當前學期（可根據實際情況調整）
function getCurrentSemester() {
    // 取得當前日期與時間
    $currentDate = new DateTime();
    $currentYear = (int) $currentDate->format('Y'); // 西元年
    $currentMonth = (int) $currentDate->format('n'); // 月份 (1-12)

    // 計算民國年
    $rocYear = $currentYear - 1911; // 民國年份

    // 判斷學期
    if ($currentMonth >= 9 || $currentMonth <= 1) {
        // 9 月到隔年 1 月為上學期
        $semester = 1;
        if ($currentMonth <= 1) {
            // 1 月時，學年為前一年
            $rocYear -= 1;
        }
    } else {
        // 2 月到 8 月為下學期
        $semester = 2;
    }

    // 回傳當前學期
    return "{$rocYear}{$semester}";
}



//1. 取得使用者專業必修
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
                    $gradeLevel = max(1, $currentAcademicYear - (int)$academicYear + 1);

                    // 取得當前學期
                    $currentSemester = getCurrentSemester();


                    // 查詢已儲存的當期科系必修課程
                    $query = "
                        SELECT  
                            課程.編號 AS id, 
                            1 AS mark, 
                            課程.科目中文名稱 AS courseName, 
                            CAST(SUBSTRING_INDEX(課程.上課節次, ',', 1) AS UNSIGNED) AS startPeriod, -- 起始節次
                            CAST(SUBSTRING_INDEX(課程.上課節次, ',', -1) AS UNSIGNED) AS endPeriod, -- 結束節次
                            課程.上課星期 AS weekDay,
                            0 AS category, 
                            1 AS isPlaced, 
                            課程.學期 AS semester, 
                            課程.學分數 AS credits 
                        FROM  
                            課程
                        WHERE  
                            (課程.課別名稱 LIKE '%專業必修%') -- 篩選 category = 0
                            AND 課程.系所代碼 = :departmentCode
                            AND 課程.年級 = :gradeLevel
                            AND SUBSTRING(課程.科目代碼_新碼, -2, 1) = :classCode
                            AND 課程.學期 = :currentSemester -- 確保只查詢當前學期
                    ";

                    $courseStmt = $link->prepare($query);       
                    $courseStmt->bindParam(':departmentCode', $departmentCode, PDO::PARAM_STR);
                    $courseStmt->bindParam(':gradeLevel', $gradeLevel, PDO::PARAM_INT);
                    $courseStmt->bindParam(':classCode', $classLetter, PDO::PARAM_STR);
                    $courseStmt->bindParam(':currentSemester', $currentSemester, PDO::PARAM_INT);  // 綁定 currentSemester

                    // 執行查詢
                    $courseStmt->execute();

                    // 處理查詢結果
                    if ($courseStmt->rowCount() > 0) {
                        $savedRequired = $courseStmt->fetchAll(PDO::FETCH_ASSOC);
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

/* getSavedElectiveCourses 回傳格式
{
    "success": true,
    "savedElective": [
      {
        "id": 397,
        "mark": 1,
        "courseName": "R語言統計",
        "startPeriod": 6,
        "endPeriod": 7,
        "category": 1,
        "isPlaced": "0",
        "semester": "1131",
        "credits": "2.00"
      },
      {
        "id": 430,
        "mark": 1,
        "courseName": "網路與資訊安全",
        "startPeriod": 2,
        "endPeriod": 4,
        "category": 1,
        "isPlaced": "0",
        "semester": "1131",
        "credits": "3.00"
      }
    ]
  }
  */
//2. 取得使用者已儲存的課程
function getSavedElectiveCourses($link)
{
    // 從 Session 中取得 userID
    $userID = $_SESSION['userID'] ?? null;
    if (!$userID || !filter_var($userID, FILTER_VALIDATE_INT)) {
        http_response_code(401); // 未授權
        echo json_encode(["error" => "用戶未登入或無效的用戶 ID"]);
        return;
    }

    // 定義 SQL 查詢
    $query = "
        SELECT  
            課程.編號 AS id, 
            1 AS mark, 
            課程.科目中文名稱 AS courseName, 
            CAST(SUBSTRING_INDEX(課程.上課節次, ',', 1) AS UNSIGNED) AS startPeriod, -- 起始節次
            CAST(SUBSTRING_INDEX(課程.上課節次, ',', -1) AS UNSIGNED) AS endPeriod, -- 結束節次
            課程.上課星期 AS weekDay,
            1 AS category, 
            課程規劃.放置狀態 AS isPlaced, 
            課程.學期 AS semester, 
            課程.學分數 AS credits 
        FROM  
            用戶收藏 
        INNER JOIN  
            課程 ON 用戶收藏.課程ID = 課程.編號 
        INNER JOIN  
            課程規劃 ON 課程.編號 = 課程規劃.課程ID 
        WHERE  
            (課程.課別名稱 NOT LIKE '%專業必修%') -- 篩選 category = 1
            AND 用戶收藏.用戶ID = :userID
        GROUP BY 
            課程.編號, 課程規劃.放置狀態, 課程.科目中文名稱, 課程.上課節次, 課程.上課星期, 課程.學期, 課程.學分數;
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

/*
成功:

{
  "success": true,
  "message": "課程顯示狀態更新成功",
  "updatedCourse": {
    "id": "397",
    "isPlaced": "1"
  }
}
*/

//3. 更新課程的顯示/隱藏狀態 
function updateCourseVisibility($link, $inputData)
{
    // 獲取請求中的資料
    $userID = $_SESSION['userID'] ?? null;
    $id = $inputData['id'] ?? null;
    $isPlaced = $inputData['isPlaced'] ?? null;

    // 驗證必要參數
    if (empty($userID) || empty($id) || !isset($isPlaced)) {
        http_response_code(400);
        echo json_encode(["error" => "缺少必要參數"]);
        return;
    }

    // 把 isPlaced 轉換為字串 ('0' 或 '1')
    $isPlaced = (string) $isPlaced; 

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
        $checkStmt->bindParam(':userID', $userID, PDO::PARAM_INT); // 綁定用戶ID
        $checkStmt->bindParam(':id', $id, PDO::PARAM_INT); // 綁定課程ID

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

        $stmt = $link->prepare($updateQuery); // 預處理查詢
        $stmt->bindParam(':userID', $userID, PDO::PARAM_INT); // 綁定用戶ID
        $stmt->bindParam(':id', $id, PDO::PARAM_INT); // 綁定課程ID
        $stmt->bindParam(':isPlaced', $isPlaced, PDO::PARAM_STR); // 綁定顯示狀態為字串

        if ($stmt->execute()) { // 執行查詢
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



