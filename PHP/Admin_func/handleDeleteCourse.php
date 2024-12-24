<?php
// -------------------------------------------------------------
// (4) 函式區：刪除單一課程
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
                "message" => "課程刪除成功",
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
            "message" => "課程刪除失敗: " . $e->getMessage(),
            "success" => false
        ]);
    }
}
?>
