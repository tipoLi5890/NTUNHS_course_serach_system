<?php
// -------------------------------------------------------------
// (2) 函式區：新增/修改單筆課程 (含 PDF)
// -------------------------------------------------------------

/**
 * handleUploadSingleCourse - 新增或修改單筆課程 (含 PDF)
 * 假設欄位從 $_POST 取得
 * 
 * 成功範例：若科目代碼和學期組合在資料庫中尚未存在，則會'新增'課程資料；若資料已存在，則會執行'更新'操作。
 * 失敗範例：
 * 1. 若缺少必填欄位，會返回錯誤訊息，例如：「欄位 [課程編號] 不可為空」。
 * 2. 若資料庫操作失敗（如語法錯誤），則返回錯誤訊息。
 * 
 * 成功時的輸出範例：
 * ```json
 * {
 *     "message": "單筆課程上傳成功",
 *     "success": true
 * }
 * ```
 * 
 * 失敗時的輸出範例：
 * 1. 缺少必填欄位：
 * ```json
 * {
 *     "message": "欄位 [課程編號] 不可為空",
 *     "success": false
 * }
 * ```
 * 2. 資料庫操作錯誤：
 * ```json
 * {
 *     "message": "單筆課程上傳失敗: 資料庫錯誤",
 *     "success": false
 * }
 * ```
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

    // 接收欄位
    $courseCode       = $_POST['課程編號'];
    $semester         = $_POST['學期'];
    $mainTeacher      = $_POST['主開課教師姓名'];
    $subjectCode      = $_POST['科目代碼_新碼'];
    $departmentCode   = $_POST['系所代碼'];
    $coreFourCode     = $_POST['核心四碼'];
    $subjectGroup     = $_POST['科目組別'];
    $grade            = $_POST['年級'];
    $classGroup       = $_POST['上課班組'];
    $subjectNameCN    = $_POST['科目中文名稱'];
    $subjectNameEN    = $_POST['科目英文名稱'];
    $teacherName      = $_POST['授課教師姓名'];
    $classSize        = $_POST['上課人數'];
    $credit           = $_POST['學分數'];
    $classWeeks       = $_POST['上課週次'];
    $classHoursPerWeek= $_POST['上課時數_週'];
    $courseCodeType   = $_POST['課別代碼'];
    $courseName       = $_POST['課別名稱'];
    $classLocation    = $_POST['上課地點'];
    $classDay         = $_POST['上課星期'];
    $classPeriod      = $_POST['上課節次'];
    $courseRemark     = $_POST['課表備註'];
    $courseSummaryCN  = $_POST['課程中文摘要'];
    $courseSummaryEN  = $_POST['課程英文摘要'];

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
        // 檢查資料庫中是否已經存在該課程
        $stmtCheck = $link->prepare("SELECT 1 FROM 課程 WHERE 科目代碼_新碼 = :subjectCode AND 學期 = :semester AND 科目中文名稱 = :subjectNameCN");
        $stmtCheck->bindValue(':subjectCode', $subjectCode, PDO::PARAM_STR);
        $stmtCheck->bindValue(':semester', $semester, PDO::PARAM_STR);
        $stmtCheck->bindValue(':subjectNameCN', $subjectNameCN, PDO::PARAM_STR);
        $stmtCheck->execute();

        if ($stmtCheck->rowCount() > 0) {
            // 如果存在，執行更新操作
            $stmt = $link->prepare("
                UPDATE 課程 SET
                    課程編號 = :courseCode,
                    主開課教師姓名 = :mainTeacher,
                    系所代碼 = :departmentCode,
                    核心四碼 = :coreFourCode,
                    科目組別 = :subjectGroup,
                    年級 = :grade,
                    上課班組 = :classGroup,
                    科目中文名稱 = :subjectNameCN,
                    科目英文名稱 = :subjectNameEN,
                    授課教師姓名 = :teacherName,
                    上課人數 = :classSize,
                    學分數 = :credit,
                    上課週次 = :classWeeks,
                    上課時數_週 = :classHoursPerWeek,
                    課別代碼 = :courseCodeType,
                    課別名稱 = :courseName,
                    上課地點 = :classLocation,
                    上課星期 = :classDay,
                    上課節次 = :classPeriod,
                    課表備註 = :courseRemark,
                    課程中文摘要 = :courseSummaryCN,
                    課程英文摘要 = :courseSummaryEN,
                    教學計劃PDF路徑 = :pdfPath
                WHERE 科目代碼_新碼 = :subjectCode AND 學期 = :semester AND 科目中文名稱 = :subjectNameCN
            ");
        } else {
            // 如果不存在，執行新增操作
            $stmt = $link->prepare("
                INSERT INTO 課程 (
                    課程編號, 學期, 主開課教師姓名, 科目代碼_新碼, 系所代碼,
                    核心四碼, 科目組別, 年級, 上課班組, 科目中文名稱,
                    科目英文名稱, 授課教師姓名, 上課人數, 學分數, 上課週次,
                    上課時數_週, 課別代碼, 課別名稱, 上課地點, 上課星期,
                    上課節次, 課表備註, 課程中文摘要, 課程英文摘要, 教學計劃PDF路徑
                ) VALUES (
                    :courseCode, :semester, :mainTeacher, :subjectCode, :departmentCode,
                    :coreFourCode, :subjectGroup, :grade, :classGroup, :subjectNameCN,
                    :subjectNameEN, :teacherName, :classSize, :credit, :classWeeks,
                    :classHoursPerWeek, :courseCodeType, :courseName, :classLocation, :classDay,
                    :classPeriod, :courseRemark, :courseSummaryCN, :courseSummaryEN, :pdfPath
                )
            ");
        }

        $stmt->bindValue(':courseCode',       $courseCode,       PDO::PARAM_STR);
        $stmt->bindValue(':semester',         $semester,         PDO::PARAM_STR);
        $stmt->bindValue(':mainTeacher',      $mainTeacher,      PDO::PARAM_STR);
        $stmt->bindValue(':subjectCode',      $subjectCode,      PDO::PARAM_STR);
        $stmt->bindValue(':departmentCode',   $departmentCode,   PDO::PARAM_STR);
        $stmt->bindValue(':coreFourCode',     $coreFourCode,     PDO::PARAM_STR);
        $stmt->bindValue(':subjectGroup',     $subjectGroup,     PDO::PARAM_STR);
        $stmt->bindValue(':grade',            $grade,            PDO::PARAM_STR);
        $stmt->bindValue(':classGroup',       $classGroup,       PDO::PARAM_STR);
        $stmt->bindValue(':subjectNameCN',    $subjectNameCN,    PDO::PARAM_STR);
        $stmt->bindValue(':subjectNameEN',    $subjectNameEN,    PDO::PARAM_STR);
        $stmt->bindValue(':teacherName',      $teacherName,      PDO::PARAM_STR);
        $stmt->bindValue(':classSize',        $classSize,        PDO::PARAM_INT);
        $stmt->bindValue(':credit',           $credit,           PDO::PARAM_INT);
        $stmt->bindValue(':classWeeks',       $classWeeks,       PDO::PARAM_STR);
        $stmt->bindValue(':classHoursPerWeek',$classHoursPerWeek,PDO::PARAM_STR);
        $stmt->bindValue(':courseCodeType',   $courseCodeType,   PDO::PARAM_STR);
        $stmt->bindValue(':courseName',       $courseName,       PDO::PARAM_STR);
        $stmt->bindValue(':classLocation',    $classLocation,    PDO::PARAM_STR);
        $stmt->bindValue(':classDay',         $classDay,         PDO::PARAM_STR);
        $stmt->bindValue(':classPeriod',      $classPeriod,      PDO::PARAM_STR);
        $stmt->bindValue(':courseRemark',     $courseRemark,     PDO::PARAM_STR);
        $stmt->bindValue(':courseSummaryCN',  $courseSummaryCN,  PDO::PARAM_STR);
        $stmt->bindValue(':courseSummaryEN',  $courseSummaryEN,  PDO::PARAM_STR);
        $stmt->bindValue(':pdfPath',          $pdfPath,          PDO::PARAM_STR);

        $stmt->execute();

        // 檢查是否為更新還是新增
        if ($stmtCheck->rowCount() > 0) {
            echo json_encode([
                "message" => "課程更新成功",
                "success" => true
            ]);
        } else {
            echo json_encode([
                "message" => "課程新增成功",
                "success" => true
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "message" => "單筆課程上傳失敗: " . $e->getMessage(),
            "success" => false
        ]);
    }
}
?>

