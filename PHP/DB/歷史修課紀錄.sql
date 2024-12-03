CREATE TABLE 歷史修課紀錄 (
    修課ID INT AUTO_INCREMENT NOT NULL PRIMARY KEY, -- 修課紀錄唯一ID
    用戶ID INT NOT NULL,                            -- 外鍵，指向用戶表
    課程ID INT NOT NULL,                            -- 外鍵，指向課程表
    修課日期 DATE NOT NULL,                         -- 修課完成日期
    FOREIGN KEY (用戶ID) REFERENCES 用戶(用戶ID) ON DELETE CASCADE,
    FOREIGN KEY (課程ID) REFERENCES 課程(編號) ON DELETE CASCADE
);

INSERT INTO 歷史修課紀錄 (用戶ID, 課程ID, 修課日期)
VALUES
    (2, 101, '2024-05-15'), 
    (2, 102, '2024-07-20'),  
    (2, 103, '2024-09-10'),  
    (2, 104, '2024-011-22'),  
    (2, 105, '2024-012-31'); 
