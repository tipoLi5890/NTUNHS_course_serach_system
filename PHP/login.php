<?php
// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start(); // 初始化 Session
include("configure.php");

// 處理 JSON 格式的數據
if ($_SERVER["CONTENT_TYPE"] === "application/json") {
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['username']) && isset($input['password'])) {
        $_POST['username'] = $input['username'];
        $_POST['password'] = $input['password'];
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // 驗證輸入完整性
    if (empty($_POST['username']) || empty($_POST['password'])) {
        http_response_code(400);
        echo json_encode(array(
            "message" => "請提供帳號和密碼",
            "success" => false
        ));
        exit;
    }

    $username = $_POST['username'];
    $password = $_POST['password'];

    try {
        // 預處理語句，防止 SQL Injection
        $stmt = $link->prepare("SELECT * FROM 用戶 WHERE 帳號 = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // 驗證密碼（假設存儲的密碼已經是雜湊值）
            // if (password_verify($password, $user['密碼'])) {
            //     $_SESSION['密碼'] = $user['密碼'];

            //     echo json_encode(array(
            //         "message" => "登入成功",
            //         "success" => true
            //     ));
            //     exit;
            // }
            
            $_SESSION['用戶ID'] = $user['用戶ID'];

            echo json_encode(array(
                "message" => "登入成功",
                "success" => true
            ));
            exit;
        }

        // 若帳號或密碼不匹配
        http_response_code(401);
        echo json_encode(array(
            "message" => "帳號或密碼錯誤",
            "success" => false
        ));
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array(
            "message" => "伺服器錯誤",
            "success" => false
        ));
    }
}
?>
