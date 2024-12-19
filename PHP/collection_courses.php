<?php
/**
 * API 說明:
 * 此 API 支援三種操作 (action):
 * 1. save-course: 收藏課程
 *    - 前端請傳遞:
 *      {
 *          "action": "save-course",
 *          "id": 課程ID
 *      }
 *    - 後端回應:
 *      成功: {
 *          "success": true,
 *          "message": "課程已成功儲存。"
 *      }
 *      失敗 (已收藏): {
 *          "success": false,
 *          "message": "課程已經收藏。"
 *      }
 *
 * 2. unsave-course: 取消收藏課程
 *    - 前端請傳遞:
 *      {
 *          "action": "unsave-course",
 *          "id": 課程ID
 *      }
 *    - 後端回應:
 *      成功: {
 *          "success": true,
 *          "message": "已取消儲存此課程"
 *      }
 *      失敗 (尚未收藏): {
 *          "success": false,
 *          "message": "課程尚未收藏，無法取消。"
 *      }
 *
 * 3. get-saved-courses: 獲取已收藏課程
 *    - 前端請傳遞:
 *      {
 *          "action": "get-saved-courses"
 *      }
 *    - 後端回應:
 *      成功: {
 *          "success": true,
 *          "savedCourses": [
 *              課程資料陣列 (每個課程包含完整資訊)
 *          ]
 *      }
 *
 * 共通錯誤:
 * - 無效的操作: {
 *     "success": false,
 *     "message": "無效的操作。"
 *   }
 * - 缺少必要參數: {
 *     "success": false,
 *     "message": "缺少必要參數。"
 *   }
 * - 驗證失敗: {
 *     "success": false,
 *     "message": "無效的 Session Token，請重新登入。"
 *   }
 * - 未登入或 Session 過期: {
 *     "success": false,
 *     "message": "Session 過期或未登入。"
 *   }
 */

// 設定 CORS 和 JSON 回應格式
header('Access-Control-Allow-Origin: http://localhost:5173'); // 指定允許的來源
header('Content-Type: application/json'); // 指定回應格式為 JSON
header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); // 設定允許的 HTTP 方法
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'); // 設定允許的請求標頭
header('Access-Control-Allow-Credentials: true'); // 啟用 Cookie 傳遞

// 檢查是否為 OPTIONS 預檢請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // 返回 200 狀態碼，表明預檢成功
    exit;
}

session_start(); // 初始化 Session
include("configure.php"); // 包含資料庫配置文件

if (isset($_COOKIE['sessionToken']) && isset($_SESSION['sessionToken'])) {
    if ($_COOKIE['sessionToken'] === $_SESSION['sessionToken']) {
        // 驗證成功，可以進一步處理請求

        if (isset($_SESSION['userID'])) {
            $userID = $_SESSION['userID']; // 取得用戶ID
            $inputData = json_decode(file_get_contents('php://input'), true); // 獲取前端傳送的JSON數據

            if (isset($inputData['action'])) {
                $action = $inputData['action'];

                try {
                    if ($action === 'save-course') {
                        // 檢查是否已收藏
                        $checkStmt = $link->prepare("SELECT 1 FROM 用戶收藏 WHERE 用戶ID = :userID AND 課程ID = :courseID");
                        $checkStmt->bindParam(':userID', $userID, PDO::PARAM_INT);
                        $checkStmt->bindParam(':courseID', $inputData['id'], PDO::PARAM_INT);
                        $checkStmt->execute();

                        if ($checkStmt->rowCount() > 0) {
                            echo json_encode([
                                "success" => false,
                                "message" => "課程已經收藏。"
                            ]);
                        } else {
                            // 收藏課程
                            $saveStmt = $link->prepare("INSERT INTO 用戶收藏 (用戶ID, 課程ID) VALUES (:userID, :courseID)");
                            $saveStmt->bindParam(':userID', $userID, PDO::PARAM_INT);
                            $saveStmt->bindParam(':courseID', $inputData['id'], PDO::PARAM_INT);
                            $saveStmt->execute();

                            echo json_encode([
                                "success" => true,
                                "message" => "課程已成功儲存。"
                            ]);
                        }

                    } elseif ($action === 'unsave-course') {
                        // 檢查是否已取消收藏
                        $checkStmt = $link->prepare("SELECT 1 FROM 用戶收藏 WHERE 用戶ID = :userID AND 課程ID = :courseID");
                        $checkStmt->bindParam(':userID', $userID, PDO::PARAM_INT);
                        $checkStmt->bindParam(':courseID', $inputData['id'], PDO::PARAM_INT);
                        $checkStmt->execute();

                        if ($checkStmt->rowCount() === 0) {
                            echo json_encode([
                                "success" => false,
                                "message" => "課程尚未收藏，無法取消。"
                            ]);
                        } else {
                            // 取消收藏課程
                            $unsaveStmt = $link->prepare("DELETE FROM 用戶收藏 WHERE 用戶ID = :userID AND 課程ID = :courseID");
                            $unsaveStmt->bindParam(':userID', $userID, PDO::PARAM_INT);
                            $unsaveStmt->bindParam(':courseID', $inputData['id'], PDO::PARAM_INT);
                            $unsaveStmt->execute();

                            echo json_encode([
                                "success" => true,
                                "message" => "已取消儲存此課程"
                            ]);
                        }

                    } elseif ($action === 'get-saved-courses') {
                        // 獲取已收藏的課程
                        $getCoursesStmt = $link->prepare("SELECT k.* FROM 用戶收藏 uc INNER JOIN 課程 k ON uc.課程ID = k.編號 WHERE uc.用戶ID = :userID");
                        $getCoursesStmt->bindParam(':userID', $userID, PDO::PARAM_INT);
                        $getCoursesStmt->execute();

                        $savedCourses = $getCoursesStmt->fetchAll(PDO::FETCH_ASSOC);

                        echo json_encode([
                            "success" => true,
                            "savedCourses" => $savedCourses
                        ]);

                    } else {
                        // 無效的動作
                        http_response_code(400);
                        echo json_encode([
                            "success" => false,
                            "message" => "無效的操作。"
                        ]);
                    }
                } catch (PDOException $e) {
                    // 資料庫操作出錯
                    http_response_code(500);
                    echo json_encode([
                        "success" => false,
                        "message" => "伺服器錯誤，無法完成操作。",
                        "error" => $e->getMessage()
                    ]);
                }

            } else {
                // 缺少參數
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "缺少必要參數。"
                ]);
            }

        } else {
            // 如果用戶ID不存在
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "message" => "未找到用戶ID，請重新登入。"
            ]);
        }
    } else {
        // 驗證失敗，返回未授權狀態
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "無效的 Session Token，請重新登入。"
        ]);
        exit;
    }
} else {
    // 沒有 Session Token，可能未登入或 Session 過期
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Session 過期或未登入。"
    ]);
    exit;
}
?>
