-- 用戶收藏表
CREATE TABLE 用戶收藏 (
    收藏ID INT AUTO_INCREMENT NOT NULL PRIMARY KEY,  -- 收藏的唯一ID
    用戶ID INT NOT NULL,                             -- 外鍵，指向用戶表
    課程ID INT NOT NULL,                             -- 外鍵，指向課程表
    收藏時間 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- 收藏時間
    FOREIGN KEY (用戶ID) REFERENCES 用戶(用戶ID) ON DELETE CASCADE,
    FOREIGN KEY (課程ID) REFERENCES 課程(編號) ON DELETE CASCADE,
    UNIQUE (用戶ID, 課程ID)                          -- 保證每個用戶對課程只能收藏一次
);

INSERT INTO 用戶收藏 (用戶ID, 課程ID)
VALUES
    (2, 101),  
    (2, 102),  
    (2, 103), 
    (2, 104),  
    (2, 105);  
