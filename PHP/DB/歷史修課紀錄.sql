CREATE TABLE 歷史修課紀錄 (
    修課ID INT AUTO_INCREMENT NOT NULL PRIMARY KEY, -- 修課紀錄唯一ID
    用戶ID INT NOT NULL,                            -- 外鍵，指向用戶表
    課程ID INT NOT NULL,                            -- 外鍵，指向課程表
    FOREIGN KEY (用戶ID) REFERENCES 用戶(用戶ID) ON DELETE CASCADE,
    FOREIGN KEY (課程ID) REFERENCES 課程(編號) ON DELETE CASCADE
);

INSERT INTO 歷史修課紀錄 (用戶ID, 課程ID)
VALUES
    (2, 101), 
    (2, 102),  
    (2, 103),  
    (2, 104),  
    (2, 105); 
