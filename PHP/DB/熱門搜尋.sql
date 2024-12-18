-- 創建熱門搜尋表
CREATE TABLE 熱門搜尋 (
    ID INT AUTO_INCREMENT NOT NULL PRIMARY KEY,  -- 熱門搜尋唯一ID
    課程ID INT NOT NULL,                         -- 外鍵，指向課程表的課程ID
    查詢次數 INT DEFAULT 0,                      -- 默認查詢次數為0
    FOREIGN KEY (課程ID) REFERENCES 課程(編號) ON DELETE CASCADE  -- 外鍵約束
);

-- 初始化熱門搜尋數據，為現有課程插入記錄
INSERT INTO 熱門搜尋 (課程ID)
SELECT 編號 FROM 課程;

-- 儲存程序: 更新熱門搜尋次數
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

-- 儲存程序: 新課程引入後，將新課程插入熱門搜尋表
DELIMITER $$

CREATE TRIGGER 新增課程時更新熱門搜尋
AFTER INSERT ON 課程
FOR EACH ROW
BEGIN
    -- 檢查熱門搜尋表中是否已經存在該課程
    IF NOT EXISTS (SELECT 1 FROM 熱門搜尋 WHERE 課程ID = NEW.編號) THEN
        -- 如果不存在該課程ID，則插入新的熱門搜尋記錄
        INSERT INTO 熱門搜尋 (課程ID, 查詢次數)
        VALUES (NEW.編號, 0);
    END IF;
END$$

DELIMITER ;


-- 當刪除課程時，對應的熱門搜尋記錄也會自動被刪除。
DELIMITER $$

CREATE TRIGGER 刪除課程時更新熱門搜尋
AFTER DELETE ON 課程
FOR EACH ROW
BEGIN
    DELETE FROM 熱門搜尋 WHERE 課程ID = OLD.編號;
END$$

DELIMITER ;