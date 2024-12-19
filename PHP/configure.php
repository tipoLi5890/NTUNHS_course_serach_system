<?php
    $servername = "localhost:3307"; // 伺服器名稱，通常本地端是 "localhost"
    $username = "root";        // MySQL 使用者名稱，預設是 "root"
    $password = "";            // MySQL 使用者的密碼，預設為空
    $dbname = "course_search_system";  // MySQL 資料庫名稱，這裡是 "userDatabase"

    $link = new PDO('mysql:host='.$servername.';dbname='.$dbname.';charset=utf8mb4', $username, $password);    
?>