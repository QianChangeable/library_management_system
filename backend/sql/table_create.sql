create table if not exists students (
    stu_id varchar(255) primary key, -- 学号
    name varchar(50) unique not null, -- 姓名
    password varchar(255) not null, -- 密码
    trust float default 1, -- 信任度
    created_at timestamp default current_timestamp
);