<?php
// -------------------------------------------------------------
// (1) 設定 CORS 和 JSON 回應格式
// -------------------------------------------------------------
header('Access-Control-Allow-Origin: http://localhost:5173'); // 根據需要調整
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS'); // 統一使用 POST 方法
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true'); // 啟用 Cookie 傳遞

session_start(); // 初始化 Session
include("configure.php"); // 包含資料庫連線設定 (PDO: $link)

// 處理 OPTIONS 請求（CORS 預檢）
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -------------------------------------------------------------
// (2) 判斷是否有登入 Session (若需要登入檢查)
// -------------------------------------------------------------
// 如果需要限制只有登入使用者才能操作，則取消註解
// if (!isset($_SESSION['userID'])) {
//     http_response_code(401);
//     echo json_encode([
//         "message" => "Session 過期或未登入",
//         "success" => false
//     ]);
//     exit;
// }

// -------------------------------------------------------------
// (3) 解析輸入：
//     - 如果是 JSON: 透過 file_get_contents + json_decode
//     - 如果是檔案上傳: 需要從 $_POST / $_FILES 取得
// -------------------------------------------------------------
$rawInput = file_get_contents('php://input');

// 嘗試解析 JSON，若解析失敗或是空的，代表可能是 multipart/form-data
$jsonInput = json_decode($rawInput, true);
if (json_last_error() === JSON_ERROR_NONE && $jsonInput !== null) {
    // 以 JSON 方式提交
    $action = isset($jsonInput['action']) ? $jsonInput['action'] : null;
    $payload = $jsonInput; // 其他參數
} else {
    // 以 multipart/form-data 方式提交，action 從 $_POST 拿
    $action = isset($_POST['action']) ? $_POST['action'] : null;
    $payload = $_POST; // 其他參數 (不含檔案)
}

// -------------------------------------------------------------
// (4) 檢查 action
// -------------------------------------------------------------
if (!$action) {
    http_response_code(400);
    echo json_encode([
        "message" => "缺少 action 參數",
        "success" => false
    ]);
    exit;
}

// -------------------------------------------------------------
// (5) 根據 action 路由
// -------------------------------------------------------------
switch ($action) {
    case 'getAll': // OK
        handleGetAllCourses();
        break;

    // case 'uploadSingle':
    //     handleUploadSingleCourse();
    //     break;

    // case 'uploadBatch':
    //     handleUploadBatchCourses();
    //     break;

    // case 'updateCourse':
    //     handleUpdateCourse($payload);
    //     break;

    // case 'deleteCourse':
    //     handleDeleteCourse($payload);
    //     break;

    default:
        http_response_code(400);
        echo json_encode([
            "message" => "未知的 action 參數: $action",
            "success" => false
        ]);
        break;
}

// -------------------------------------------------------------
// (6) 函式區：查詢所有課程
// -------------------------------------------------------------
/**
 * handleGetAllCourses - 查詢所有課程
 * 回傳上課星期中文 & 系所名稱
 */
function handleGetAllCourses() {
    global $link;

    $sql = "
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
        LEFT JOIN 系所對照表 d ON k.系所代碼 = d.系所代碼
    ";

    try {
        $stmt = $link->prepare($sql);
        $stmt->execute();
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "message" => "查詢成功",
            "success" => true,
            "courses" => $courses
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "message" => "查詢失敗: " . $e->getMessage(),
            "success" => false
        ]);
    }
}

// -------------------------------------------------------------
// (7) 函式區：新增單筆課程 (含 PDF)
// -------------------------------------------------------------
/**
 * handleUploadSingleCourse - 新增單筆課程 (含 PDF)
 * 假設欄位從 $_POST 取得
 */
function handleUploadSingleCourse() {
    global $link;

    // 必填欄位 (根據實際欄位增加/刪減)
    $requiredFields = [
        '課程編號', '學期', '主開課教師姓名',
        '科目代碼_新碼', '系所代碼', '核心四碼',
        '科目組別', '年級', '上課班組',
        '科目中文名稱', '科目英文名稱', '授課教師姓名',
        '上課人數', '學分數', '上課週次',
        '上課時數_週', '課別代碼', '課別名稱',
        '上課地點', '上課星期', '上課節次',
        '課表備註', '課程中文摘要', '課程英文摘要'
    ];

    // 逐一檢查必填
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field]) || $_POST[$field] === '') {
            http_response_code(400);
            echo json_encode([
                "message" => "欄位 [$field] 不可為空",
                "success" => false
            ]);
            return;
        }
    }

    // 接收欄位 (部分示範)
    $courseCode = $_POST['課程編號'];
    $semester   = $_POST['學期'];
    $mainTeacher = $_POST['主開課教師姓名'];
    // ... 其他欄位，請依實際需求取值

    // PDF 檔案處理 (若有)
    $pdfPath = null;
    if (isset($_FILES['teachingPlan']) && $_FILES['teachingPlan']['error'] === 0) {
        $pdfFileName = $_FILES['teachingPlan']['name'];
        $pdfTmpPath  = $_FILES['teachingPlan']['tmp_name'];

        // 檔案儲存位置
        $uploadDir = __DIR__ . '/uploads/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $destination = $uploadDir . $pdfFileName;
        move_uploaded_file($pdfTmpPath, $destination);
        $pdfPath = $destination; // 可存入資料庫
    }

    try {
        // 寫入資料庫 (示範插入部分欄位，可自行擴充)
        $stmt = $link->prepare("
            INSERT INTO 課程 (
                課程編號,
                學期,
                主開課教師姓名,
                PDF路徑
            ) VALUES (
                :courseCode,
                :semester,
                :mainTeacher,
                :pdfPath
            )
        ");
        $stmt->bindValue(':courseCode', $courseCode, PDO::PARAM_STR);
        $stmt->bindValue(':semester',   $semester,   PDO::PARAM_STR);
        $stmt->bindValue(':mainTeacher',$mainTeacher,PDO::PARAM_STR);
        $stmt->bindValue(':pdfPath',    $pdfPath,    PDO::PARAM_STR);
        $stmt->execute();

        echo json_encode([
            "message" => "單筆課程上傳成功",
            "success" => true
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "message" => "單筆課程上傳失敗: " . $e->getMessage(),
            "success" => false
        ]);
    }
}

// -------------------------------------------------------------
// (8) 函式區：批次上傳 CSV (可含多筆檔案，但此處示範單一檔 csvFile)
// -------------------------------------------------------------
function handleUploadBatchCourses() {
    global $link;

    // 檔案必須使用 multipart/form-data
    if (!isset($_FILES['csvFile'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "未收到 csvFile 檔案",
            "success" => false
        ]);
        return;
    }

    // CSV 檔案路徑
    $file = $_FILES['csvFile']['tmp_name'];
    if (!file_exists($file)) {
        http_response_code(400);
        echo json_encode([
            "message" => "無法讀取 CSV 檔案",
            "success" => false
        ]);
        return;
    }

    // 讀取 CSV
    if (($handle = fopen($file, "r")) !== FALSE) {
        // 讀表頭 (如果有)
        $header = fgetcsv($handle);

        // flag 紀錄插入成功與否
        $importSuccess = true;

        while (($data = fgetcsv($handle)) !== FALSE) {
            // 假設 CSV 有 10~30 欄，請依實際欄位調整
            if (count($data) < 5) {
                $importSuccess = false;
                echo json_encode([
                    "message" => "CSV 檔案格式錯誤，欄位不足",
                    "success" => false
                ]);
                break;
            }

            // 取出必要欄位 (示範)
            $courseCode  = $data[0];
            $semester    = $data[1];
            $teacherName = $data[2];
            // ... 其他欄位 ...

            // 做 INSERT
            try {
                $sql = "
                    INSERT INTO 課程 (課程編號, 學期, 主開課教師姓名) 
                    VALUES (:courseCode, :semester, :teacherName)
                ";
                $stmt = $link->prepare($sql);
                $stmt->bindValue(':courseCode',  $courseCode,  PDO::PARAM_STR);
                $stmt->bindValue(':semester',    $semester,    PDO::PARAM_STR);
                $stmt->bindValue(':teacherName', $teacherName, PDO::PARAM_STR);
                $stmt->execute();
            } catch (Exception $e) {
                $importSuccess = false;
                echo json_encode([
                    "message" => "批次匯入失敗: " . $e->getMessage(),
                    "success" => false
                ]);
                break;
            }
        }

        fclose($handle);

        if ($importSuccess) {
            echo json_encode([
                "message" => "CSV 匯入成功",
                "success" => true
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "message" => "無法打開 CSV 檔案",
            "success" => false
        ]);
    }
}

// -------------------------------------------------------------
// (9) 函式區：修改單一課程 (JSON)
// -------------------------------------------------------------
/**
 * handleUpdateCourse - 修改課程
 * 需在 JSON input 中包含 data: {...}，其中含「編號」與各欄位新值
 */
function handleUpdateCourse($payload) {
    global $link;

    if (!isset($payload['data']) || !is_array($payload['data'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "缺少 data 參數或格式錯誤",
            "success" => false
        ]);
        return;
    }

    $data = $payload['data'];
    if (!isset($data['編號'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "缺少課程 編號",
            "success" => false
        ]);
        return;
    }
    $id = $data['編號'];

    // 這裡僅示範修改「課程編號」跟「學期」，其餘欄位請自行加上
    // 可用 prepared statement 動態生成 SQL
    $courseCode = isset($data['課程編號']) ? $data['課程編號'] : null;
    $semester   = isset($data['學期'])     ? $data['學期']     : null;

    // 省略更多欄位 ...
    try {
        $sql = "
            UPDATE 課程
            SET 課程編號 = :courseCode,
                學期 = :semester
            WHERE 編號 = :id
        ";
        $stmt = $link->prepare($sql);
        $stmt->bindValue(':courseCode', $courseCode, PDO::PARAM_STR);
        $stmt->bindValue(':semester',   $semester,   PDO::PARAM_STR);
        $stmt->bindValue(':id',         $id,         PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                "message" => "更新成功",
                "success" => true
            ]);
        } else {
            // rowCount() 為 0 可能代表沒有改動
            echo json_encode([
                "message" => "沒有任何改動，或課程不存在",
                "success" => true
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "message" => "更新失敗: " . $e->getMessage(),
            "success" => false
        ]);
    }
}

// -------------------------------------------------------------
// (10) 函式區：刪除單一課程 (JSON)
// -------------------------------------------------------------
function handleDeleteCourse($payload) {
    global $link;

    if (!isset($payload['id'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "缺少課程 id 參數",
            "success" => false
        ]);
        return;
    }

    $id = $payload['id'];
    try {
        $stmt = $link->prepare("DELETE FROM 課程 WHERE 編號 = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                "message" => "刪除成功",
                "success" => true
            ]);
        } else {
            echo json_encode([
                "message" => "課程不存在，或已被刪除",
                "success" => false
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "message" => "刪除失敗: " . $e->getMessage(),
            "success" => false
        ]);
    }
}
?>
