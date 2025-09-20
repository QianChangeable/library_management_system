create table if not exists students (
    stu_id varchar(255) primary key, -- 学号
    name varchar(50) unique not null, -- 姓名
    password varchar(255) not null, -- 密码
    trust float default 1, -- 信任度
    can_borrow boolean default true, -- 是否可以借阅
    created_at timestamp default current_timestamp
);

create table if not exists books (
    book_id varchar(255) primary key, -- 图书编号
    title varchar(255) not null, -- 书名
    author varchar(100) not null, -- 作者
    description text, -- 简介
    total_copies int default 0, -- 总馆藏数量
    available_copies int default 0, -- 可借阅数量
    can_borrow boolean default true, -- 是否可以借阅
    created_at timestamp default current_timestamp
);

create table if not exists borrow_records (
    id int auto_increment primary key,
    stu_id varchar(255) not null, -- 学号
    book_id varchar(255) not null, -- 图书编号
    borrow_date timestamp default current_timestamp, -- 借书时间
    due_date timestamp, -- 预计还书时间
    return_date timestamp, -- 实际还书时间
    is_overdue boolean default false, -- 是否逾期
    fine_amount decimal(10,2) default 0, -- 罚款金额
    created_at timestamp default current_timestamp,
    foreign key (stu_id) references students(stu_id),
    foreign key (book_id) references books(book_id)
);
