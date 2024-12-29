<?php
// -------------------------------------------------------------
// (4) 函式區：刪除單一課程
// -------------------------------------------------------------

/**
 * handleDeleteCourse - 刪除指定課程
 * 
 * 功能：刪除指定 ID 的課程資料。若課程不存在或已刪除，回傳相應訊息。
 * 
 * @param array $payload 輸入資料，包含課程 ID
 */
function handleDeleteCourse($payload) {
    global $link;

    // 檢查是否提供課程 ID
    if (empty($payload['id'])) {
        sendResponse(400, "缺少課程 id 參數", false);
        return;
    }

    $id = (int)$payload['id']; // 強制轉型為整數以避免 SQL 注入

    try {
        // 準備刪除課程的 SQL 語句
        $stmt = $link->prepare("DELETE FROM 課程 WHERE 編號 = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        // 判斷是否有成功刪除
        if ($stmt->rowCount() > 0) {
            sendResponse(200, "課程刪除成功", true);
        } else {
            sendResponse(404, "課程不存在，或已被刪除", false);
        }
    } catch (Exception $e) {
        // 捕獲錯誤並回傳
        sendResponse(500, "課程刪除失敗: " . $e->getMessage(), false);
    }
}

/**
 * sendResponse - 回傳 JSON 格式的回應
 * 
 * @param int $statusCode HTTP 狀態碼
 * @param string $message 回應訊息
 * @param bool $success 是否成功
 */
function sendResponse($statusCode, $message, $success) {
    http_response_code($statusCode);
    echo json_encode([
        "message" => $message,
        "success" => $success
    ]);
    exit;
}
?>
