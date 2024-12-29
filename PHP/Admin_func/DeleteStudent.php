<?php

function sendResponse($statusCode, $message, $success) {
    http_response_code($statusCode);
    echo json_encode([
        "message" => $message,
        "success" => $success
    ]);
    exit;
}

function DeleteStudent($payload) {
    global $link;

    // 檢查是否提供了用戶 ID
    if (empty($payload['userid'])) {
        sendResponse(400, "缺少用戶 id 參數", false);
    }

    $userid = $payload['userid'];

    try {
        // 準備 SQL 查詢
        $stmt = $link->prepare("DELETE FROM 用戶 WHERE 用戶ID = :userid");
        $stmt->bindValue(':userid', $userid, PDO::PARAM_INT);
        $stmt->execute();

        // 判斷是否刪除了任何資料
        if ($stmt->rowCount() > 0) {
            sendResponse(200, "用戶刪除成功", true);
        } else {
            sendResponse(404, "用戶不存在，或已被刪除", false);
        }
    } catch (PDOException $e) {
        // 捕獲資料庫錯誤
        sendResponse(500, "用戶刪除失敗: " . $e->getMessage(), false);
    } catch (Exception $e) {
        // 捕獲其他錯誤
        sendResponse(500, "用戶刪除失敗: " . $e->getMessage(), false);
    }
}
?>
