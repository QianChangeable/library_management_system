# 图书管理系统

一个基于Go和MySQL的图书管理系统，提供图书查询、借阅、归还和罚款管理功能。

## 功能特性

- 📚 图书查询：根据书名或作者搜索图书
- 📖 借书管理：学生借阅图书，自动生成借阅记录
- 🔄 还书管理：处理图书归还，计算逾期罚款
- ⚠️ 罚款系统：自动计算逾期罚款，管理学生借阅权限
- 🎯 事务处理：所有数据库操作使用SQL事务保证数据一致性

## 技术栈

- **后端**: Go (Gin框架)
- **数据库**: MySQL
- **ORM**: 纯SQL操作（不使用ORM）
- **事务管理**: 数据库事务保证数据一致性

## 数据库设计

### 表结构

1. **students表**: 学生信息
   - stu_id: 学号（主键）
   - name: 姓名
   - password: 密码
   - trust: 信任度
   - can_borrow: 是否可以借阅
   - created_at: 创建时间

2. **books表**: 图书信息
   - book_id: 图书编号（主键）
   - title: 书名
   - author: 作者
   - description: 简介
   - total_copies: 总馆藏数量
   - available_copies: 可借阅数量
   - can_borrow: 是否可以借阅
   - created_at: 创建时间

3. **borrow_records表**: 借阅记录
   - id: 自增主键
   - stu_id: 学号（外键）
   - book_id: 图书编号（外键）
   - borrow_date: 借书时间
   - due_date: 预计还书时间
   - return_date: 实际还书时间
   - is_overdue: 是否逾期
   - fine_amount: 罚款金额
   - created_at: 创建时间

## 安装和运行

### 前置要求

- Go 1.18+
- MySQL 5.7+
- Git

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd library_management_system
```

2. 创建MySQL数据库
```sql
CREATE DATABASE library_management;
```

3. 执行建表脚本
```bash
mysql -u root -p library_management < backend/sql/table_create.sql
```

4. 插入测试数据
```bash
mysql -u root -p library_management < backend/test/test_data.sql
```

5. 配置数据库连接
修改 `backend/main.go` 中的数据库连接字符串：
```go
db, err := dao.NewSQLDB("用户名:密码@tcp(地址:端口)/library_management?charset=utf8mb4&parseTime=True&loc=Local")
```

6. 安装依赖
```bash
cd backend
go mod tidy
```

7. 运行应用
```bash
go run main.go
```

## API接口

### 图书相关

1. **搜索图书**
   - `GET /books/search?keyword=搜索词`
   - 根据书名或作者搜索图书

2. **获取图书详情**
   - `GET /books/:id`
   - 根据图书ID获取详细信息

### 借阅相关

1. **借书**
   - `POST /borrow/borrow`
   - 请求体: `{"stu_id": "学号", "book_id": "图书编号"}`

2. **还书**
   - `POST /borrow/return`
   - 请求体: `{"stu_id": "学号", "book_id": "图书编号"}`
   - 返回逾期罚款金额（如果有）

3. **支付罚款**
   - `POST /borrow/pay-fine`
   - 请求体: `{"stu_id": "学号"}`

4. **获取借阅记录**
   - `GET /borrow/record?stu_id=学号&book_id=图书编号`

### 健康检查

- `GET /health` - 服务健康状态检查

## 业务规则

1. **借书规则**:
   - 学生必须没有未支付的罚款才能借书
   - 图书必须有可借阅的副本
   - 借阅期限为2个月

2. **罚款规则**:
   - 逾期每天罚款0.5元
   - 有逾期罚款的学生不能借书
   - 支付罚款后恢复借阅权限

3. **还书规则**:
   - 还书时自动检查是否逾期
   - 逾期会自动计算罚款并禁用借阅权限

## 项目结构

```
backend/
├── controller/     # 控制器层
├── dao/           # 数据访问层
├── do/            # 数据对象
├── service/       # 业务逻辑层
├── sql/           # SQL脚本
├── test/          # 测试数据
└── main.go        # 应用入口
```

## 开发说明

- 所有数据库操作使用原生SQL，不使用ORM
- 使用事务保证数据一致性
- 错误处理使用Go标准错误处理
- API响应遵循RESTful规范

## 许可证

MIT License
