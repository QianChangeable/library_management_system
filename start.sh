#!/bin/bash

echo "启动图书管理系统..."
echo "请确保MySQL数据库已启动并配置正确"

cd backend

# 检查是否安装了Go
if ! command -v go &> /dev/null; then
    echo "错误: 未找到Go，请先安装Go 1.18+"
    exit 1
fi

# 检查是否安装了MySQL客户端（用于测试）
if ! command -v mysql &> /dev/null; then
    echo "警告: 未找到MySQL客户端，请手动创建数据库"
fi

echo "编译应用..."
go build -o library_manager .

echo "启动服务..."
./library_manager
