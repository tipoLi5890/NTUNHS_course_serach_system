-- 啟用事件調度器
SET GLOBAL event_scheduler = ON;

CREATE TABLE 課程評價 (
    評價ID INT AUTO_INCREMENT NOT NULL PRIMARY KEY,  -- 評價的唯一ID
    用戶ID INT NOT NULL,                             -- 外鍵，指向用戶表
    課程ID INT NOT NULL,                             -- 外鍵，指向課程表
    評價文本 TEXT,                                   -- 用戶的文字評價
    評價時間 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- 評價時間
    評論狀態 ENUM('Y', 'N', 'L') DEFAULT 'N',        -- Y:已評論/N:未評論/L:鎖定
    FOREIGN KEY (用戶ID) REFERENCES 用戶(用戶ID) ON DELETE CASCADE,
    FOREIGN KEY (課程ID) REFERENCES 課程(編號) ON DELETE CASCADE,
    UNIQUE (用戶ID, 課程ID)                          -- 保證每個用戶對課程只能評價一次
);

-- 插入測試數據
INSERT INTO 課程評價 (用戶ID, 課程ID, 評價文本, 評論狀態)
VALUES
    (2, 101, '這門課程內容豐富且實用，推薦給初學者。', 'Y'),
    (2, 102, '講師講解清楚，但部分內容可以更詳細些。', 'Y'),
    (2, 103, '課程安排很好，實例教學幫助很大。', 'Y'),
    (2, 104, '課程有些難度，但學習過程令人滿足。', 'Y'),
    (2, 105, '整體課程還不錯，但需要更多互動環節。', 'Y');

-- 創建每年2/1開放評論的事件
CREATE EVENT 每年上學期結束開放評論
ON SCHEDULE EVERY 1 YEAR
STARTS '2024-02-01 00:00:00'
DO
    UPDATE 課程評價
    SET 評論狀態 = 'N'
    WHERE 評論狀態 <> 'N';

-- 創建每年8/1開放評論的事件
CREATE EVENT 每年下學期結束開放評論
ON SCHEDULE EVERY 1 YEAR
STARTS '2024-08-01 00:00:00'
DO
    UPDATE 課程評價
    SET 評論狀態 = 'N'
    WHERE 評論狀態 <> 'N';

-- 創建每年3/1鎖定評論的事件
CREATE EVENT 每年上學期評論鎖定
ON SCHEDULE EVERY 1 YEAR
STARTS '2024-03-01 00:00:00'
DO
    UPDATE 課程評價
    SET 評論狀態 = 'L'
    WHERE 評論狀態 = 'N';

-- 創建每年9/1鎖定評論的事件
CREATE EVENT 每年下學期評論鎖定
ON SCHEDULE EVERY 1 YEAR
STARTS '2024-09-01 00:00:00'
DO
    UPDATE 課程評價
    SET 評論狀態 = 'L'
    WHERE 評論狀態 = 'N';

-- 測試事件調度器
SHOW EVENTS;

-- 觸發器：新增評論後自動設置評論狀態為 'Y'
DELIMITER $$

CREATE TRIGGER 新增評論後更新狀態
AFTER INSERT ON 課程評價
FOR EACH ROW
BEGIN
    UPDATE 課程評價
    SET 評論狀態 = 'Y'
    WHERE 評價ID = NEW.評價ID;
END$$

DELIMITER ;
