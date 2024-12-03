CREATE TABLE 用戶 (
    用戶ID INT AUTO_INCREMENT NOT NULL PRIMARY KEY,      -- 用戶的唯一ID
    姓名 VARCHAR(100) NOT NULL,                          -- 用戶的真實姓名 
    出生日期 DATE NOT NULL,                              -- 用戶的出生日期
    身分證字號 VARCHAR(10) NOT NULL UNIQUE,              -- 用戶的身分證字號，唯一
    電子郵件 VARCHAR(100) NOT NULL UNIQUE,               -- 用戶的電子郵件，唯一
    帳號 VARCHAR(50) NOT NULL UNIQUE,                    -- 用戶登入帳號，唯一
    密碼 VARCHAR(255) NOT NULL,                          -- 密碼
    角色 ENUM('admin', 'student') NOT NULL,              -- 用戶角色
    狀態 ENUM('active', 'inactive', 'banned') DEFAULT 'active', -- 用戶狀態
    創建時間 TIMESTAMP DEFAULT CURRENT_TIMESTAMP         -- 創建時間
);

-- 插入一個管理員(admin)用戶
INSERT INTO 用戶(姓名,出生日期,身分證字號,電子郵件,帳號,密碼,角色,狀態)
VALUES('張三', '1985-07-20', 'A123456789', 'root@google.com', 'root', '789', 'admin', 'active');
-- 插入一個學生(student)用戶
INSERT INTO 用戶(姓名,出生日期,身分證字號,電子郵件,帳號,密碼,角色,狀態)
VALUES('林千欣', '2000-03-29', 'B987654321', 'xin@google.com', 'xin', '123', '學生', 'active');
-- 插入一個被封禁(banned)的學生用戶
INSERT INTO 用戶(姓名,出生日期,身分證字號,電子郵件,帳號,密碼,角色,狀態)
VALUES('王五', '1998-11-05', 'C123789456', 'wangwu@google.com', '五', '456', '學生', 'banned');