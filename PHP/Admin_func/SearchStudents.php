<?php
// -------------------------------------------------------------
// (8) 函式區：查詢單筆學生資訊
// 功能介紹：
// 此函式用於根據提供的 `用戶ID` 查詢單一學生的資料，回傳學生的基本資訊，包括用戶ID、姓名、帳號、角色和狀態。
// 查詢過程中，會確保該用戶的角色為 "student"。如果查詢成功，會返回該學生的資料；
// 若查無此學生，會回傳 404 錯誤，表示找不到該學生的資訊。
// 
// 使用方法：
// - Action: search-student
// - HTTP 方法：POST
// - 必填參數：`用戶ID`
//   用戶ID 用來查詢特定學生的資料
//
// 回傳格式：JSON
// - 成功：
//   {
//       "message": "學生資訊查詢成功",
//       "success": true,
//       "data": {
//           "用戶ID": "112214227",
//           "姓名": "林耕宇",
//           "帳號": "112214227",
//           "角色": "student",
//           "狀態": "active"
//       }
//   }
// - 失敗：
//   - 用戶ID 欄位缺失或為空：
//   {
//       "message": "欄位 [用戶ID] 不可為空",
//       "success": false
//   }
//   - 查無此學生：
//   {
//       "message": "找不到該學生資訊",
//       "success": false
//   }
//   - 查詢失敗時：
//   {
//       "message": "學生資訊查詢失敗: 錯誤訊息",
//       "success": false
//   }
//
// 功能邏輯：
// 1. 透過 `POST` 方法接收參數 `用戶ID`。
// 2. 檢查 `用戶ID` 是否存在且不為空，若缺少此欄位則回傳錯誤訊息。
// 3. 使用 `SELECT` 語句查詢資料表 `用戶`，根據提供的 `用戶ID` 查詢該學生的基本資料，並確保其角色為 "student"。
// 4. 若查詢到學生資料，將結果回傳給前端。
// 5. 若查詢無結果，回傳 404 錯誤並通知查無此學生。
// 6. 若查詢過程中發生錯誤，回傳 500 錯誤並包含錯誤訊息。
// -------------------------------------------------------------
function GetStudent() {
    global $link;

    // 必填欄位：用戶ID
    if (!isset($_POST['用戶ID']) || $_POST['用戶ID'] === '') {
        http_response_code(400);
        echo json_encode([
            "message" => "欄位 [用戶ID] 不可為空",
            "success" => false
        ]);
        return;
    }

    // 接收參數
    $userCode = $_POST['用戶ID'];

    try {
        // 查詢單筆學生資料，並確保角色為 'student'
        $stmt = $link->prepare("
            SELECT 用戶ID, 姓名, 帳號, 角色, 狀態
            FROM 用戶
            WHERE 用戶ID = :userCode AND 角色 = 'student'
        ");
        $stmt->bindValue(':userCode', $userCode, PDO::PARAM_STR);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $studentData = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode([
                "message" => "學生資訊查詢成功",
                "success" => true,
                "data" => $studentData
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                "message" => "找不到該學生資訊",
                "success" => false
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "message" => "學生資訊查詢失敗: " . $e->getMessage(),
            "success" => false
        ]);
    }
}
?>
