<?php
// -------------------------------------------------------------
// (7) 函式區：刪除單一學生
// 功能介紹：
// 此函式用於刪除資料庫中指定的學生記錄，根據提供的 `用戶ID` 作為唯一識別碼進行操作。
// 若刪除成功，回傳成功訊息；若未找到相符記錄，回傳錯誤訊息。
// 同時支援例外處理，確保資料庫操作的穩定性。
//
// 使用方法：
// - Action: delete-student
// - HTTP 方法：POST
// - 必填參數：
//   - id：欲刪除學生的唯一識別碼。
//
// 回傳結果：
// - 成功：刪除成功並回傳相關訊息。
// - 失敗：刪除失敗或記錄不存在，回傳錯誤訊息及原因。
//
// 回傳格式：JSON
// - 成功：
//   {
//       "message": "用戶刪除成功",
//       "success": true
//   }
// - 失敗（用戶不存在）：
//   {
//       "message": "用戶不存在，或已被刪除",
//       "success": false
//   }
// - 失敗（例外情況）：
//   {
//       "message": "用戶刪除失敗: 錯誤原因",
//       "success": false
//   }
//
// 注意事項：
// - 此函式會直接刪除資料庫記錄，請謹慎使用。
// - 確保執行刪除操作前已進行必要的權限驗證。
// -------------------------------------------------------------
function DeleteStudent($payload) {
    global $link;

    if (!isset($payload['userid'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "缺少用戶 id 參數",
            "success" => false
        ]);
        return;
    }

    $id = $payload['userid'];
    try {
        $stmt = $link->prepare("DELETE FROM 用戶 WHERE 用戶ID = :userid");
        $stmt->bindValue(':userid', $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                "message" => "用戶刪除成功",
                "success" => true
            ]);
        } else {
            echo json_encode([
                "message" => "用戶不存在，或已被刪除",
                "success" => false
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "message" => "用戶刪除失敗: " . $e->getMessage(),
            "success" => false
        ]);
    }
}
?>
