<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Credentials: true');

session_start();

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (isset($_COOKIE['sessionToken']) && isset($_SESSION['sessionToken']) && $_COOKIE['sessionToken'] === $_SESSION['sessionToken']) {
        echo json_encode([
            "success" => true,
            "message" => "使用者已登入",
            "isLoggedIn" => true,
            "username" => $_SESSION['username'] ?? null,
            "userID" => $_SESSION['userID'] ?? null
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "未登入",
            "isLoggedIn" => false
        ]);
    }
}
