-- 創建熱門搜尋表
CREATE TABLE 熱門搜尋 (
    ID INT AUTO_INCREMENT NOT NULL PRIMARY KEY,  -- 熱門搜尋唯一ID
    課程ID INT NOT NULL,                         -- 外鍵，指向課程表的課程ID
    查詢次數 INT DEFAULT 0,                      -- 默認查詢次數為0
    FOREIGN KEY (課程ID) REFERENCES 課程(編號)   -- 外鍵約束
);

-- 初始化熱門搜尋數據，為現有課程插入記錄
INSERT INTO 熱門搜尋 (課程ID)
SELECT 編號 FROM 課程;

DELIMITER $$

CREATE PROCEDURE 更新熱門搜尋次數(IN 搜尋課程ID INT)
BEGIN
    -- 檢查是否存在該課程ID的記錄
    IF EXISTS (SELECT 1 FROM 熱門搜尋 WHERE 課程ID = 搜尋課程ID) THEN
        -- 如果存在，查詢次數加1
        UPDATE 熱門搜尋
        SET 查詢次數 = 查詢次數 + 1
        WHERE 課程ID = 搜尋課程ID;
    ELSE
        -- 如果不存在，插入新的記錄，並設置查詢次數為1
        INSERT INTO 熱門搜尋 (課程ID, 查詢次數)
        VALUES (搜尋課程ID, 1);
    END IF;
END$$

DELIMITER ;
