#!/bin/bash

# 测试学生登录接口
echo "测试学生登录接口..."

# 启动服务器（后台运行）
cd backend
go run main.go &
SERVER_PID=$!

# 等待服务器启动
sleep 3

# 测试登录接口
echo "发送登录请求..."
curl -X POST http://localhost:8085/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "stu_id": "20230001",
    "password": "password123"
  }'

echo -e "\n\n测试获取学生信息接口..."
curl -X GET "http://localhost:8085/student/info?stu_id=20230001"

# 停止服务器
kill $SERVER_PID 2>/dev/null
