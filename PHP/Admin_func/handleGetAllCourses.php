<?php
// -------------------------------------------------------------
// (1) 函式區：查詢所有課程
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
?>