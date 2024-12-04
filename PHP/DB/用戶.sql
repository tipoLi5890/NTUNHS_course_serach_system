CREATE TABLE 用戶 (
    用戶ID INT AUTO_INCREMENT NOT NULL PRIMARY KEY,      -- 用戶的唯一ID
    姓名 VARCHAR(100) NOT NULL,                          -- 用戶的真實姓名  
    帳號 VARCHAR(50) NOT NULL UNIQUE,                    -- 用戶登入帳號，唯一
    密碼 VARCHAR(255) NOT NULL,                          -- 密碼（應存儲加密後的值）
    角色 ENUM('admin', 'student') NOT NULL,              -- 用戶角色
    狀態 ENUM('active', 'inactive', 'banned') DEFAULT 'active', -- 用戶狀態
    創建時間 TIMESTAMP DEFAULT CURRENT_TIMESTAMP         -- 創建時間
);

-- 插入一個管理員(admin)用戶
INSERT INTO 用戶(姓名,帳號,密碼,角色,狀態)
VALUES('張三', 'root', '123', 'admin', 'active');

-- 插入一個學生(student)用戶
INSERT INTO 用戶(姓名,帳號,密碼,角色,狀態)
VALUES('林千欣', '112214228', '228', 'student', 'active');

-- 插入一個被封禁(banned)的學生用戶
INSERT INTO 用戶(姓名,帳號,密碼,角色,狀態)
VALUES('王五', 'five', '456', 'student', 'banned');
