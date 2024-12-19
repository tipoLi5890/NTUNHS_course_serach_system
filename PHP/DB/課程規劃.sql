CREATE TABLE 課程規劃 (
    規劃ID INT AUTO_INCREMENT NOT NULL PRIMARY KEY, -- 課程規劃的唯一ID
    用戶ID INT NOT NULL,                            -- 外鍵，指向用戶表
    課程ID INT NOT NULL,                            -- 外鍵，指向課程表
    加入時間 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- 課程加入時間
    放置狀態 ENUM('0', '1') DEFAULT '0',             -- isPlaced在這
    FOREIGN KEY (用戶ID) REFERENCES 用戶(用戶ID) ON DELETE CASCADE,
    FOREIGN KEY (課程ID) REFERENCES 課程(編號) ON DELETE CASCADE,
    UNIQUE (用戶ID, 課程ID)                         -- 保證用戶對同一課程的規劃不會重複
);

DELIMITER //

CREATE TRIGGER 收藏加入規劃
AFTER INSERT ON 用戶收藏
FOR EACH ROW
BEGIN
    INSERT IGNORE INTO 課程規劃 (用戶ID, 課程ID, 加入時間)
    VALUES (NEW.用戶ID, NEW.課程ID, NEW.收藏時間);
END;
//

DELIMITER ;


DELIMITER //

CREATE TRIGGER 收藏刪除規劃
AFTER DELETE ON 用戶收藏
FOR EACH ROW
BEGIN
    DELETE FROM 課程規劃
    WHERE 用戶ID = OLD.用戶ID AND 課程ID = OLD.課程ID;
END;
//

DELIMITER ;
