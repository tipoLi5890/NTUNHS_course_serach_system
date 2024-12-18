-- 啟用事件調度器
SET GLOBAL event_scheduler = ON;

-- 創建課程評價表
CREATE TABLE 課程評價 (
    評價ID INT AUTO_INCREMENT NOT NULL PRIMARY KEY,  -- 評價的唯一ID
    用戶ID INT NOT NULL,                             -- 外鍵，指向用戶表
    課程ID INT NOT NULL,                             -- 外鍵，指向課程表
    評價文本 TEXT,                                   -- 用戶的文字評價
    評價時間 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- 評價時間
    評論狀態 ENUM('Y', 'N', 'L') DEFAULT 'N',        -- Y:已評論/N:未評論/L:鎖定
    -- 評論開放時間:
    -- 上學期:每年2/1~3/1
    -- 下學期:每年8/1~9/1
    FOREIGN KEY (用戶ID) REFERENCES 用戶(用戶ID) ON DELETE CASCADE,
    FOREIGN KEY (課程ID) REFERENCES 課程(編號) ON DELETE CASCADE,
    UNIQUE (用戶ID, 課程ID)                          -- 保證每個用戶對課程只能評價一次
);

-- 插入測試數據
INSERT INTO 課程評價 (用戶ID, 課程ID, 評價文本, 評論狀態)
VALUES
    (2, 101, '這門課程內容豐富且實用，推薦給初學者。', 'Y'),
    (2, 102, '講師講解清楚，但部分內容可以更詳細些。', 'Y'),
    (2, 104, '課程有些難度，但學習過程令人滿足。', 'Y'),
    (2, 105, '整體課程還不錯，但需要更多互動環節。', 'Y');

-- 上學期評論開放：隔年的2月1日
DELIMITER $$

CREATE EVENT 上學期開放評論
ON SCHEDULE EVERY 1 YEAR
STARTS CONCAT(YEAR(CURDATE()) , '-12-01 00:00:00') -- 將開放日期設置為隔年12月1日(作為演示功能用)

-- STARTS CONCAT(YEAR(CURDATE()) + 1, '-02-01 00:00:00') -- 將開放日期設置為隔年2月1日
DO
BEGIN
    DECLARE currentYear INT;
    DECLARE currentSemester CHAR(4);
    SET currentYear = YEAR(CURDATE()) - 1911; -- 將西元年轉為民國年
    SET currentSemester = CONCAT(currentYear, '1'); -- 上學期為結尾1

    UPDATE 課程評價
    SET 評論狀態 = 'N'
    WHERE 評論狀態 <> 'N';
END$$

DELIMITER ;

-- 下學期評論開放：每年8月1日
DELIMITER $$

CREATE EVENT 下學期開放評論
ON SCHEDULE EVERY 1 YEAR
STARTS CONCAT(YEAR(CURDATE()), '-08-01 00:00:00')
DO
BEGIN
    DECLARE currentYear INT;
    DECLARE currentSemester CHAR(4);
    SET currentYear = YEAR(CURDATE()) - 1911; -- 將西元年轉為民國年
    SET currentSemester = CONCAT(currentYear, '2'); -- 下學期為結尾2

    UPDATE 課程評價
    SET 評論狀態 = 'N'
    WHERE 評論狀態 <> 'N';
END$$

DELIMITER ;

-- 上學期評論鎖定：每年3月1日
DELIMITER $$

CREATE EVENT 上學期評論鎖定
ON SCHEDULE EVERY 1 YEAR
STARTS CONCAT(YEAR(CURDATE()) + 1, '-03-01 00:00:00') -- 隔年3月1日
DO
BEGIN
    UPDATE 課程評價
    SET 評論狀態 = 'L'
    WHERE 評論狀態 = 'N';
END$$

DELIMITER ;

-- 下學期評論鎖定：每年9月1日
DELIMITER $$

CREATE EVENT 下學期評論鎖定
ON SCHEDULE EVERY 1 YEAR
STARTS CONCAT(YEAR(CURDATE()), '-09-01 00:00:00')
DO
BEGIN
    UPDATE 課程評價
    SET 評論狀態 = 'L'
    WHERE 評論狀態 = 'N';
END$$

DELIMITER ;

-- 新增或更新歷史修課紀錄
DELIMITER $$

CREATE PROCEDURE 更新歷史修課紀錄()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_用戶ID INT;
    DECLARE v_課程ID INT;

    -- 定義游標選取用戶修課紀錄
    DECLARE 修課游標 CURSOR FOR
        SELECT 用戶ID, 課程ID FROM 歷史修課紀錄;
    
    -- 定義繼續游標操作的處理
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN 修課游標;

    read_loop: LOOP
        FETCH 修課游標 INTO v_用戶ID, v_課程ID;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- 檢查用戶是否已對該課程進行評價
        IF NOT EXISTS (SELECT 1 FROM 課程評價 WHERE 用戶ID = v_用戶ID AND 課程ID = v_課程ID) THEN
            -- 若無評價資料，則插入新的資料，預設評價文本和評價時間為空
            INSERT INTO 課程評價 (用戶ID, 課程ID, 評價文本, 評論狀態)
            VALUES (v_用戶ID, v_課程ID, '', 'N');
        END IF;

    END LOOP;

    CLOSE 修課游標;
END$$

DELIMITER ;

-- 執行更新歷史修課紀錄
CALL 更新歷史修課紀錄();
