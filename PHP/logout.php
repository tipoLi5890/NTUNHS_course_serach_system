<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // 清除 Session
    session_unset();
    session_destroy();

    // 清除 Cookie
    setcookie('sessionToken', '', time() - 3600, '/', '', false, true);

    echo json_encode([
        "success" => true,
        "message" => "已登出"
    ]);
}
