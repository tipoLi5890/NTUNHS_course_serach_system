
-- 課程評價表
CREATE TABLE 課程評價 (
    評價ID INT AUTO_INCREMENT NOT NULL PRIMARY KEY,  -- 評價的唯一ID
    用戶ID INT NOT NULL,                             -- 外鍵，指向用戶表
    課程ID INT NOT NULL,                             -- 外鍵，指向課程表
    評價文本 TEXT,                                   -- 用戶的文字評價
    評價時間 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- 評價時間
    評論狀態 ENUM('Y', 'N') DEFAULT 'N',                 -- 評論狀態：'Y' 已評價，'N' 未評價
    FOREIGN KEY (用戶ID) REFERENCES 用戶(用戶ID) ON DELETE CASCADE,
    FOREIGN KEY (課程ID) REFERENCES 課程(編號) ON DELETE CASCADE,
    UNIQUE (用戶ID, 課程ID)                          -- 保證每個用戶對課程只能評價一次
);

INSERT INTO 課程評價 (用戶ID, 課程ID, 評價文本, 評論狀態)
VALUES
    (2, 101, '這門課程內容豐富且實用，推薦給初學者。', 'Y'),
    (2, 102, '講師講解清楚，但部分內容可以更詳細些。', 'Y'),
    (2, 103, '課程安排很好，實例教學幫助很大。', 'Y'),
    (2, 104, '課程有些難度，但學習過程令人滿足。', 'Y'),
    (2, 105, '整體課程還不錯，但需要更多互動環節。', 'Y');
