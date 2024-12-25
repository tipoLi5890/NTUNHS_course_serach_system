<?php
// -------------------------------------------------------------
// (5) 函式區：取得所有學生資訊
// 功能介紹：
// 此函式用於從資料庫中查詢所有角色為 "student" 的學生資料，回傳學生的基本資料，包括用戶ID、姓名、帳號、角色與狀態。
// 回傳結果會以 JSON 格式呈現，並告知前端查詢是否成功。
// 
// 使用方法：
// - Action: get-all-student
// - HTTP 方法：GET
// - 無需任何參數，會回傳所有學生的資料。
//
// 回傳格式：JSON
// - 成功：
//   {
//       "message": "查詢成功",
//       "success": true,
//       "student": [
//           {
//               "用戶ID": "112214227",
//               "姓名": "林耕宇",
//               "帳號": "112214227",
//               "角色": "student",
//               "狀態": "active"
//           },
//           {
//               "用戶ID": "112214228",
//               "姓名": "林千欣",
//               "帳號": "112214228",
//               "角色": "student",
//               "狀態": "active"
//           },
//           ...
//       ]
//   }
// - 失敗：
//   {
//       "message": "查詢失敗: 錯誤訊息",
//       "success": false
//   }
//
// 功能邏輯：
// 1. 透過 `SELECT * FROM 用戶 WHERE 角色 = 'student'` 查詢資料表 `用戶` 中所有角色為 "student" 的資料。
// 2. 若查詢成功，將結果轉換為 JSON 格式，並包含所有學生資料。
// 3. 若查詢失敗，則回傳錯誤訊息，並回應 HTTP 狀態碼 500。
// -------------------------------------------------------------
function GetAllStudents() {
    global $link;

    // 修改後的 SQL 查詢語法，過濾出角色為 "student" 的用戶
    $sql = "SELECT * FROM 用戶 WHERE 角色 = 'student'";

    try {
        // 執行查詢
        $stmt = $link->prepare($sql);
        $stmt->execute();
        $student = $stmt->fetchAll(PDO::FETCH_ASSOC);  // 取得所有符合條件的學生資料

        // 回傳查詢結果
        echo json_encode([
            "message" => "查詢成功",
            "success" => true,
            "student" => $student  // 將學生資料包含在回應中
        ]);
    } catch (Exception $e) {
        // 查詢失敗，回傳錯誤訊息
        http_response_code(500);  // 設定錯誤的 HTTP 狀態碼
        echo json_encode([
            "message" => "查詢失敗: " . $e->getMessage(),  // 回傳錯誤訊息
            "success" => false
        ]);
    }
}
?>
