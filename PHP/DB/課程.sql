CREATE TABLE 課程 (
    編號 INT AUTO_INCREMENT NOT NULL PRIMARY KEY, -- 用於連結課程資料表
    課程編號 VARCHAR(10) NOT NULL,
    學期 VARCHAR(10) NOT NULL,
    主開課教師姓名 VARCHAR(100),
    科目代碼_新碼 VARCHAR(50) NOT NULL,                       
    系所代碼 VARCHAR(50) NOT NULL,
    核心四碼 VARCHAR(10) NOT NULL,
    科目組別 VARCHAR(10),
    年級 INT NOT NULL,
    上課班組 INT NOT NULL,
    科目中文名稱 VARCHAR(255) NOT NULL,
    科目英文名稱 VARCHAR(255),
    授課教師姓名 VARCHAR(255),
    上課人數 INT,
    男學生上課人數 INT,
    女學生上課人數 INT,
    學分數 DECIMAL(5,2) NOT NULL,
    上課週次 VARCHAR(50),
    上課時數_週 DECIMAL(5,2),
    課別代碼 VARCHAR(50),
    課別名稱 VARCHAR(100),
    上課地點 VARCHAR(100),
    上課星期 VARCHAR(50) NOT NULL,
    上課節次 VARCHAR(50),
    課表備註 TEXT,
    課程中文摘要 TEXT,
    課程英文摘要 TEXT,
    主開課教師代碼_舊碼 VARCHAR(50),
    科目代碼_舊碼 VARCHAR(50),
    課表代碼_舊碼 VARCHAR(50),
    課表名稱_舊碼 VARCHAR(100),
    授課教師代碼_舊碼 VARCHAR(50),
    FOREIGN KEY (系所代碼) REFERENCES 系所對照表(系所代碼) ON DELETE CASCADE
    -- 如果在 系所對照表 中刪除了某個 系所代碼，並且該 系所代碼 在 課程 表中有對應的記錄，使用 ON DELETE CASCADE 會導致這些在 課程 表中的對應記錄也被自動刪除。
    -- UNIQUE (授課教師姓名, 科目代碼_舊碼, 上課星期, 上課節次, 上課地點) -- 添加唯一性約束
);

