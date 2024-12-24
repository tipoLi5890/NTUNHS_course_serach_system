<?php
// -------------------------------------------------------------
// (3) 函式區：批次上傳 CSV 檔
// -------------------------------------------------------------
function handleUploadBatchCourses() {
    global $link;

    // 檢查是否有上傳檔案
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['csvFile'])) { // 確認為 POST 請求並且有上傳檔案
        $file = $_FILES['csvFile']['tmp_name']; // 獲取上傳檔案的臨時路徑

        // 開啟 CSV 檔案
        if (($handle = fopen($file, "r")) !== FALSE) { // 嘗試打開檔案並檢查是否成功
            // 跳過表頭（如果有）
            $header = fgetcsv($handle); // 讀取 CSV 的第一行作為表頭

            // 初始化匯入成功標誌
            $import_success = true; // 預設匯入成功

            // 逐行讀取 CSV 資料並插入到資料庫
            while (($data = fgetcsv($handle)) !== FALSE) { // 每次讀取一行資料
                // 確保每行數據有足夠的欄位
                if (count($data) < 31) { // 如果資料欄位不足 31，視為格式錯誤
                    $import_success = false; // 標誌為失敗
                    echo json_encode(['message' => 'CSV 檔案格式錯誤，資料欄位不足。']); // 回傳錯誤訊息
                    break; // 結束匯入處理
                }

                // 使用 PDO 的 quote 方法來過濾數據
                $課程編號 = $link->quote($data[0]);
                $學期 = $link->quote($data[1]);
                $主開課教師姓名 = $link->quote($data[2]);
                $科目代碼_新碼 = $link->quote($data[3]);
                $系所代碼 = $link->quote($data[4]);
                $核心四碼 = $link->quote($data[5]);
                $科目組別 = $link->quote($data[6]);
                $年級 = (int)$data[7];
                $上課班組 = (int)$data[8];
                $科目中文名稱 = $link->quote($data[9]);
                $科目英文名稱 = $link->quote($data[10]);
                $授課教師姓名 = $link->quote($data[11]);
                $上課人數 = (int)$data[12];
                $男學生上課人數 = (int)$data[13];
                $女學生上課人數 = (int)$data[14];
                $學分數 = (float)$data[15];
                $上課週次 = $link->quote($data[16]);
                $上課時數_週 = (float)$data[17];
                $課別代碼 = $link->quote($data[18]);
                $課別名稱 = $link->quote($data[19]);
                $上課地點 = $link->quote($data[20]);
                $上課星期 = $link->quote($data[21]);
                $上課節次 = $link->quote($data[22]);
                $課表備註 = $link->quote($data[23]);
                $課程中文摘要 = $link->quote($data[24]);
                $課程英文摘要 = $link->quote($data[25]);
                $主開課教師代碼_舊碼 = $link->quote($data[26]);
                $科目代碼_舊碼 = $link->quote($data[27]);
                $課表代碼_舊碼 = $link->quote($data[28]);
                $課表名稱_舊碼 = $link->quote($data[29]);
                $授課教師代碼_舊碼 = $link->quote($data[30]);

                // 構建插入 SQL 語句，不包含編號
                $sql = "INSERT INTO 課程 (課程編號, 學期, 主開課教師姓名, 科目代碼_新碼, 系所代碼, 核心四碼, 科目組別, 年級, 上課班組, 科目中文名稱, 
                        科目英文名稱, 授課教師姓名, 上課人數, 男學生上課人數, 女學生上課人數, 學分數, 上課週次, 上課時數_週, 課別代碼, 課別名稱, 
                        上課地點, 上課星期, 上課節次, 課表備註, 課程中文摘要, 課程英文摘要, 主開課教師代碼_舊碼, 科目代碼_舊碼, 
                        課表代碼_舊碼, 課表名稱_舊碼, 授課教師代碼_舊碼) 
                        VALUES ($課程編號, $學期, $主開課教師姓名, $科目代碼_新碼, $系所代碼, $核心四碼, $科目組別, $年級, $上課班組, $科目中文名稱, 
                        $科目英文名稱, $授課教師姓名, $上課人數, $男學生上課人數, $女學生上課人數, $學分數, $上課週次, $上課時數_週, $課別代碼, 
                        $課別名稱, $上課地點, $上課星期, $上課節次, $課表備註, $課程中文摘要, $課程英文摘要, $主開課教師代碼_舊碼, 
                        $科目代碼_舊碼, $課表代碼_舊碼, $課表名稱_舊碼, $授課教師代碼_舊碼)"; // 插入語句，包含所有欄位值

                // 執行 SQL 語句
                if ($link->exec($sql) === false) { // 使用 PDO 的 exec 執行語句
                    $import_success = false; // 標誌為失敗
                    echo json_encode(['message' => '資料插入失敗，錯誤訊息：' . implode(' ', $link->errorInfo())]); // 回傳錯誤訊息
                    break; // 結束匯入處理
                }
            }

            fclose($handle); // 關閉 CSV 檔案

            // 根據結果顯示訊息
            if ($import_success) { // 如果所有資料匯入成功
                echo json_encode(['message' => 'CSV 匯入成功！']); // 回傳成功訊息
            } else {
                http_response_code(500); // 設置狀態碼為 500
                echo json_encode(['message' => '部分資料匯入失敗，請檢查錯誤日誌。']); // 回傳部分失敗訊息
            }
        } else {
            http_response_code(400); // 設置狀態碼為 400
            echo json_encode(['message' => '無法讀取 CSV 檔案。']); // 回傳檔案讀取失敗訊息
        }
    } else {
        http_response_code(405); // 設置狀態碼為 405 表示方法不被允許
        echo json_encode(['message' => '不支援的請求方法。']); // 回傳錯誤訊息
    }
}
?>