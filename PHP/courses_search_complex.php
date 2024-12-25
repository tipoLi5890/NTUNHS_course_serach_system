<?php
/**
 * 處理 complex-search 請求
 * 
 * 此 PHP 程式用於處理前端發送的「複雜搜尋」請求。根據傳入的多個參數，從資料庫中查詢符合條件的課程資料並回傳給前端。
 * 
 * 前端請求：
 * - 方法： POST
 * - 標頭：
 *   - Content-Type: application/json
 * - 參數： action 和其他搜尋條件
 *   ```json
 *   {
 *     "action": "complex-search",
 *     "term": "1111",
 *     "teacher": "T",
 *     "system": ["二年制", "四年制", "學士後多元專長", "碩士", "博士", "學士後學位學程", "學士後"],
 *     "room": "T",
 *     "period": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"],
 *     "grade": ["1", "2", "3", "4"],
 *     "department": ["護理系", "高照系", "資管系", "健管系", "生諮系", "幼保系", "運保系"],
 *     "day": ["1", "2", "3", "4", "5", "6", "7"],
 *     "courseType": ["專業必修(系所)", "專業選修(系所)", "通識必修(通識)", "通識選修(通識)"],
 *     "course": "E",
 *     "class": "S",
 *     "category": "跨校",
 *     "capacity": "1"
 *   }
 *   ```
 * 
 * 後端回應：
 * - 成功：
 *   ```json
 *   {
 *     "message": "查詢成功",
 *     "success": true,
 *     "courses": [課程資料陣列]
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
 *   - 其他具體錯誤訊息...
 * }
 */

// 設定 CORS 和 JSON 回應格式
include('hostOrigin.php');
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

$expectedKeys = [
    'action', 'term', 'teacher', 'system', 'room', 
    'period', 'grade', 'department', 'day', 
    'courseType', 'course', 'class', 'category', 'capacity'
];

// 檢查所有預期的 KEY 是否存在
$missingKeys = [];
foreach ($expectedKeys as $key) {
    if (!array_key_exists($key, $input)) {
        $missingKeys[] = $key;
    }
}

// 如果有缺少的 KEY，返回錯誤訊息
if (!empty($missingKeys)) {
    http_response_code(400);
    echo json_encode([
        "message" => "缺少必要的參數",
        "missingKeys" => $missingKeys, // 列出缺少的 KEY
        "success" => false
    ]);
    exit;
}

// 儲存每個傳入參數到變數
$action = $input['action']; // 操作類型
$term = $input['term']; // 搜尋學期
$teacher = $input['teacher']; // 教師名稱
$system = $input['system']; // 教育系統 (陣列)
$room = $input['room']; // 上課地點
$period = $input['period']; // 時段 (陣列)
$grade = $input['grade']; // 年級 (陣列)
$department = $input['department']; // 系所 (陣列)
$day = $input['day']; // 星期 (陣列)
$courseType = $input['courseType']; // 課程類型 (陣列)
$course = $input['course']; // 課程名稱
$class = $input['class']; // 班級
$category = $input['category']; // 課程分類
$capacity = $input['capacity']; // 課程容量

session_start(); // 初始化 Session
include("configure.php");

$includeMark = isset($_SESSION['userID']); // 或者根據您的業務邏輯設置為 false

// 開始構建 SELECT 子句
$selectFields = "
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
";

// 根據條件決定是否插入 'mark' 欄位
if ($includeMark) {
    $userID = $_SESSION['userID'];  // 取得用戶ID
    $selectFields .= ",
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM 用戶收藏 u 
            WHERE u.用戶ID = :userID AND u.課程ID = k.編號
        ) THEN 1
        ELSE 0
    END AS mark";
}
// 初始化 SQL 條件陣列和參數陣列
$sqlConditions = [];
$sqlParams = [];          

// 添加 userID 參數
if($includeMark){
    $sqlParams[':userID'] = $userID;
}

// 學期條件
if (!empty($term)) {
    $sqlConditions[] = "k.`學期` = :term";
    $sqlParams[':term'] = $term;
}

// 系統條件（使用 LIKE 組合 OR）
if (!empty($system) && is_array($system)) {
    $systemConditions = [];
    foreach ($system as $index => $sys) {
        $param = ":system{$index}";
        $systemConditions[] = "d.`系所名稱` LIKE {$param}";
        $sqlParams[$param] = "%{$sys}%";
    }
    if (!empty($systemConditions)) {
        $sqlConditions[] = "(" . implode(' OR ', $systemConditions) . ")";
    }
}

// 教師名稱條件（使用 LIKE）
if (!empty($teacher)) {
    $sqlConditions[] = "k.`授課教師姓名` LIKE :teacher";
    $sqlParams[':teacher'] = "%{$teacher}%";
}

// 上課地點條件（使用 LIKE）
if (!empty($room)) {
    $sqlConditions[] = "k.`上課地點` LIKE :room";
    $sqlParams[':room'] = "%{$room}%";
}

// 時段條件（使用 IN）
if (!empty($period) && is_array($period)) {
    // 過濾非數字
    $filteredPeriods = array_filter($period, function($p) {
        return is_numeric($p);
    });
    if (!empty($filteredPeriods)) {
        $placeholders = [];
        foreach ($filteredPeriods as $index => $p) {
            $param = ":period{$index}";
            $placeholders[] = $param;
            $sqlParams[$param] = $p;
        }
        $sqlConditions[] = "k.`上課節次` IN (" . implode(', ', $placeholders) . ")";
    }
}

// 年級條件（使用 IN）
if (!empty($grade) && is_array($grade)) {
    // 過濾非數字
    $filteredGrades = array_filter($grade, function($g) {
        return is_numeric($g);
    });
    if (!empty($filteredGrades)) {
        $placeholders = [];
        foreach ($filteredGrades as $index => $g) {
            $param = ":grade{$index}";
            $placeholders[] = $param;
            $sqlParams[$param] = $g;
        }
        $sqlConditions[] = "k.`年級` IN (" . implode(', ', $placeholders) . ")";
    }
}

// 系所條件（使用 LIKE 組合 OR）
if (!empty($department) && is_array($department)) {
    $departmentConditions = [];
    foreach ($department as $index => $dept) {
        $param = ":department{$index}";
        $departmentConditions[] = "d.`系所名稱` LIKE {$param}";
        $sqlParams[$param] = "%{$dept}%";
    }
    if (!empty($departmentConditions)) {
        $sqlConditions[] = "(" . implode(' OR ', $departmentConditions) . ")";
    }
}

// 星期條件（使用 IN）
if (!empty($day) && is_array($day)) {
    // 過濾非數字
    $filteredDays = array_filter($day, function($d) {
        return is_numeric($d);
    });
    if (!empty($filteredDays)) {
        $placeholders = [];
        foreach ($filteredDays as $index => $d) {
            $param = ":day{$index}";
            $placeholders[] = $param;
            $sqlParams[$param] = $d;
        }
        $sqlConditions[] = "k.`上課星期` IN (" . implode(', ', $placeholders) . ")";
    }
}

// 課程類型條件（使用 LIKE 組合 OR）
if (!empty($courseType) && is_array($courseType)) {
    $courseTypeConditions = [];
    foreach ($courseType as $index => $ct) {
        $param = ":courseType{$index}";
        $courseTypeConditions[] = "k.`課別名稱` LIKE {$param}";
        $sqlParams[$param] = "%{$ct}%";
    }
    if (!empty($courseTypeConditions)) {
        $sqlConditions[] = "(" . implode(' OR ', $courseTypeConditions) . ")";
    }
}

// 課程名稱條件（使用 LIKE）
if (!empty($course)) {
    $sqlConditions[] = "(k.`科目中文名稱` LIKE :course OR k.`科目英文名稱` LIKE :course)";
    $sqlParams[':course'] = "%{$course}%";
}

// 班級條件（使用 =）
if (!empty($class)) {
    $sqlConditions[] = "k.`上課班組` = :class";
    $sqlParams[':class'] = $class;
}

// 內容分類條件（使用 LIKE 組合 OR）
if (!empty($category)) {
    $categoryConditions = [];
    $categories = explode(',', $category); // 假設多個分類以逗號分隔
    foreach ($categories as $index => $cat) {
        $param = ":category{$index}";
        $categoryConditions[] = "k.`課表備註` LIKE {$param}";
        $sqlParams[$param] = "%{$cat}%";
    }
    if (!empty($categoryConditions)) {
        $sqlConditions[] = "(" . implode(' OR ', $categoryConditions) . ")";
    }
}

// 人數條件（使用 =）
if (!empty($capacity)) {
    if (is_numeric($capacity)) {
        $sqlConditions[] = "k.`上課人數` = :capacity";
        $sqlParams[':capacity'] = $capacity;
    }
}

// 構建完整的 SQL 查詢
$sql = "
    SELECT $selectFields
    FROM `課程` k
    LEFT JOIN `系所對照表` d ON k.`系所代碼` = d.`系所代碼`
";

// 添加 WHERE 子句
if (!empty($sqlConditions)) {
    $sql .= " WHERE " . implode(' AND ', $sqlConditions);
}



try {
    // 複合查詢
    $stmt = $link->prepare($sql);

    // 綁定所有參數
    foreach ($sqlParams as $param => $value) {
        // 根據參數的值類型來決定綁定的 PDO 類型
        if (is_int($value)) {
            $type = PDO::PARAM_INT;
        } elseif (is_bool($value)) {
            $type = PDO::PARAM_BOOL;
        } elseif (is_null($value)) {
            $type = PDO::PARAM_NULL;
        } else {
            $type = PDO::PARAM_STR;
        }
        $stmt->bindValue($param, $value, $type);
    }
    
    // 執行查詢
    $stmt->execute();

    // 檢查是否有課程資料
    if ($stmt->rowCount() > 0) {
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
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

?>