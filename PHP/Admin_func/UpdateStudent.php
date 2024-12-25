<?php
// -------------------------------------------------------------
// (6) 函式區：新增/修改單筆學生資訊
// 功能介紹：
// 此函式用於新增或更新學生資訊。
// 若資料庫中存在對應的 `用戶ID`，則進行資料更新；若不存在，則新增新的學生資料。
// 函式內包含必要欄位的檢查，確保資料完整性。
// 
// 使用方法：
// - Action: update-student
// - HTTP 方法：POST
// - 必填參數：
//   - 用戶ID：學生的唯一識別碼。
//   - 姓名：學生的姓名。
//   - 帳號：學生的登入帳號。
//   - 密碼：學生的登入密碼。
//   - 角色：學生的角色類型（例如：student, admin）。
//   - 狀態：學生帳號的狀態（例如：active, inactive）。
//
// 回傳結果：
// - 成功：回傳成功訊息及對應動作（新增或更新）。
// - 失敗：回傳錯誤訊息及原因。
// 
// 回傳格式：JSON
// - 成功：
//   {
//       "message": "學生資訊更新成功",
//       "success": true
//   }
//   或
//   {
//       "message": "學生新增成功",
//       "success": true
//   }
// - 失敗：
//   {
//       "message": "錯誤原因",
//       "success": false
//   }
// -------------------------------------------------------------

function UpdateStudent() {
    global $link;

    // 必填欄位 (根據實際欄位增加/刪減)
    $requiredFields = [
        '姓名', '帳號', '密碼'
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
    $userCode   = $_POST['帳號'];
    $name     = $_POST['姓名'];
    $acc      = $_POST['帳號'];
    $pwd      = $_POST['密碼'];
    $actor    = "student";
    $status   = "active";

    try {
        // 檢查資料庫中是否已經存在該學生
        $stmtCheck = $link->prepare("SELECT 1 FROM 用戶 WHERE 用戶ID = :userCode");
        $stmtCheck->bindValue(':userCode', $userCode, PDO::PARAM_STR);
        $stmtCheck->execute();

        if ($stmtCheck->rowCount() > 0) {
            // 如果存在，執行更新操作
            $stmt = $link->prepare("
                UPDATE 用戶 SET
                    姓名 = :name,
                    帳號 = :acc,
                    密碼 = :pwd,
                    角色 = :actor,
                    狀態 = :status
                WHERE 用戶ID = :userCode
            ");
        } else {
            // 如果不存在，執行新增操作
            $stmt = $link->prepare("
                INSERT INTO 用戶 (
                    用戶ID, 姓名, 帳號, 密碼, 角色, 狀態
                ) VALUES (
                    :userCode, :name, :acc, :pwd, :actor, :status
                )
            ");
        }

        // 綁定參數
        $stmt->bindValue(':userCode', $userCode, PDO::PARAM_STR);
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':acc', $acc, PDO::PARAM_STR);
        $stmt->bindValue(':pwd', $pwd, PDO::PARAM_STR);
        $stmt->bindValue(':actor', $actor, PDO::PARAM_STR);
        $stmt->bindValue(':status', $status, PDO::PARAM_STR);

        $stmt->execute();

        // 檢查是否為更新還是新增
        if ($stmtCheck->rowCount() > 0) {
            echo json_encode([
                "message" => "學生資訊更新成功",
                "success" => true
            ]);
        } else {
            echo json_encode([
                "message" => "學生新增成功",
                "success" => true
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "message" => "學生資訊上傳失敗: " . $e->getMessage(),
            "success" => false
        ]);
    }
}
?>
