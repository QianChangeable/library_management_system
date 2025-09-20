-- 插入测试数据
INSERT INTO students (stu_id, name, password, trust, can_borrow) VALUES
('20230001', '张三', 'password123', 1.0, true),
('20230002', '李四', 'password123', 1.0, true),
('20230003', '王五', 'password123', 1.0, true);

INSERT INTO books (book_id, title, author, description, total_copies, available_copies, can_borrow) VALUES
('B001', 'Go语言编程', '张三', 'Go语言入门教程', 5, 5, true),
('B002', '数据库系统概念', '李四', '数据库基础教程', 3, 3, true),
('B003', '算法导论', '王五', '算法学习经典', 2, 2, true),
('B004', '计算机网络', '赵六', '网络技术指南', 4, 4, true);

-- 插入借阅记录
INSERT INTO borrow_records (stu_id, book_id, borrow_date, due_date, return_date, is_overdue, fine_amount) VALUES
('20230001', 'B001', '2024-01-01 10:00:00', '2024-03-01 10:00:00', NULL, false, 0),
('20230002', 'B002', '2024-01-15 14:30:00', '2024-03-15 14:30:00', NULL, false, 0);
