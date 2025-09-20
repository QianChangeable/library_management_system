-- 图书馆管理系统 SQL 操作语句集合
-- 用途：包含项目中所有使用的SQL语句，按功能分类并标注用途

-- ==================== 表结构创建 ====================
-- 用途：创建系统所需的数据库表结构
-- 文件：table_create.sql

-- 学生表
CREATE TABLE IF NOT EXISTS students (
    stu_id VARCHAR(255) PRIMARY KEY, -- 学号
    name VARCHAR(50) UNIQUE NOT NULL, -- 姓名
    password VARCHAR(255) NOT NULL, -- 密码
    trust FLOAT DEFAULT 1, -- 信任度
    can_borrow BOOLEAN DEFAULT TRUE, -- 是否可以借阅
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 图书表
CREATE TABLE IF NOT EXISTS books (
    book_id VARCHAR(255) PRIMARY KEY, -- 图书编号
    title VARCHAR(255) NOT NULL, -- 书名
    author VARCHAR(100) NOT NULL, -- 作者
    description TEXT, -- 简介
    total_copies INT DEFAULT 0, -- 总馆藏数量
    available_copies INT DEFAULT 0, -- 可借阅数量
    can_borrow BOOLEAN DEFAULT TRUE, -- 是否可以借阅
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 借阅记录表
CREATE TABLE IF NOT EXISTS borrow_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stu_id VARCHAR(255) NOT NULL, -- 学号
    book_id VARCHAR(255) NOT NULL, -- 图书编号
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 借书时间
    due_date TIMESTAMP, -- 预计还书时间
    return_date TIMESTAMP, -- 实际还书时间
    is_overdue BOOLEAN DEFAULT FALSE, -- 是否逾期
    fine_amount DECIMAL(10,2) DEFAULT 0, -- 罚款金额
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stu_id) REFERENCES students(stu_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);

-- ==================== 学生相关操作 ====================
-- 用途：学生信息的查询和更新操作
-- 文件：student_dao.go

-- 根据学号获取学生信息
SELECT stu_id, name, password, trust, can_borrow, created_at
FROM students 
WHERE stu_id = ?;

-- 更新学生借阅状态
UPDATE students SET can_borrow = ? WHERE stu_id = ?;

-- 检查学生是否有未支付的罚款
SELECT COUNT(*) 
FROM borrow_records 
WHERE stu_id = ? AND is_overdue = true AND fine_amount > 0 AND return_date IS NULL;

-- ==================== 图书相关操作 ====================
-- 用途：图书信息的查询和更新操作
-- 文件：book_dao.go

-- 根据书名或作者查找书籍
SELECT book_id, title, author, description, total_copies, available_copies, can_borrow, created_at
FROM books 
WHERE (title LIKE ? OR author LIKE ?) AND can_borrow = true;

-- 根据图书ID获取书籍信息
SELECT book_id, title, author, description, total_copies, available_copies, can_borrow, created_at
FROM books 
WHERE book_id = ?;

-- 更新书籍可借阅数量
UPDATE books SET available_copies = ? WHERE book_id = ?;

-- ==================== 借阅相关操作 ====================
-- 用途：借阅记录的创建、查询和更新操作
-- 文件：borrow_dao.go

-- 创建借阅记录
INSERT INTO borrow_records (stu_id, book_id, borrow_date, due_date, return_date, is_overdue, fine_amount)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- 根据学号和图书ID获取借阅记录
SELECT id, stu_id, book_id, borrow_date, due_date, return_date, is_overdue, fine_amount, created_at
FROM borrow_records 
WHERE stu_id = ? AND book_id = ? AND return_date IS NULL;

-- 还书操作
UPDATE borrow_records 
SET return_date = ?, is_overdue = (due_date < ?)
WHERE stu_id = ? AND book_id = ? AND return_date IS NULL;

-- 更新逾期罚款金额
UPDATE borrow_records SET is_overdue = true, fine_amount = ? WHERE id = ?;

-- 获取学生的所有借阅记录
SELECT id, stu_id, book_id, borrow_date, due_date, return_date, is_overdue, fine_amount, created_at
FROM borrow_records 
WHERE stu_id = ? AND return_date IS NULL;

-- ==================== 事务操作 ====================
-- 用途：需要事务处理的复杂业务操作
-- 文件：borrow_service.go

-- 借书事务操作（包含以下SQL组合）：
-- 1. 检查学生是否可以借书
-- 2. 检查书籍是否可以借阅
-- 3. 创建借阅记录
-- 4. 减少书籍可借阅数量

-- 还书事务操作（包含以下SQL组合）：
-- 1. 检查是否逾期并计算罚款
-- 2. 执行还书操作
-- 3. 增加书籍可借阅数量
-- 4. 如果有逾期罚款，禁用学生借阅权限

-- 支付罚款事务操作（包含以下SQL组合）：
-- 1. 检查是否还有未支付的罚款
-- 2. 启用学生借阅权限

-- ==================== 测试数据 ====================
-- 用途：插入测试数据用于开发和测试
-- 文件：test_data.sql

-- 插入测试学生数据
INSERT INTO students (stu_id, name, password, trust, can_borrow) VALUES
('20230001', '张三', 'password123', 1.0, true),
('20230002', '李四', 'password123', 1.0, true),
('20230003', '王五', 'password123', 1.0, true);

-- 插入测试图书数据
INSERT INTO books (book_id, title, author, description, total_copies, available_copies, can_borrow) VALUES
('B001', 'Go语言编程', '张三', 'Go语言入门教程', 5, 5, true),
('B002', '数据库系统概念', '李四', '数据库基础教程', 3, 3, true),
('B003', '算法导论', '王五', '算法学习经典', 2, 2, true),
('B004', '计算机网络', '赵六', '网络技术指南', 4, 4, true);

-- 插入测试借阅记录
INSERT INTO borrow_records (stu_id, book_id, borrow_date, due_date, return_date, is_overdue, fine_amount) VALUES
('20230001', 'B001', '2024-01-01 10:00:00', '2024-03-01 10:00:00', NULL, false, 0),
('20230002', 'B002', '2024-01-15 14:30:00', '2024-03-15 14:30:00', NULL, false, 0);
