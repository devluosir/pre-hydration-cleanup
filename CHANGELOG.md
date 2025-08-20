# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-09

### Added
- 🚀 初始稳定版发布：CSP Nonce、扩展兼容、CLI、quickSetup、一键检查
- 🛡️ CSP安全支持：`createCSPSafeScript` 支持严格 Content Security Policy 环境
- ⚙️ 环境变量配置：`NEXT_PUBLIC_CLEANUP_ATTRS` 支持自定义属性列表
- 📊 开发环境遥测：属性清理统计和智能日志节流
- 🎯 一键集成：`quickSetup()` 函数简化项目接入
- 🔧 CLI工具：支持 script/json/module 多格式输出
- 🧪 完整测试：29个单元测试 + E2E测试框架
- 📚 企业级文档：API参考、使用指南、故障排除手册

### Changed
- 🏗️ 构建改为 ESM/CJS 双发，明确 exports 映射
- 📦 API面板锁定：核心接口（quickSetup, createCSPSafeScript, cleanup）标记为稳定
- 🔒 类型安全：完整的 TypeScript 类型定义和只读数组保护

### Fixed
- 🐛 TypeScript 只读数组类型与 gunzip 类型收敛
- ⚡ React 组件属性正确传递和可选参数处理
- 🔧 Jest 配置优化和测试环境DOM清理完善

### Security
- 🛡️ CSP nonce 支持防止脚本注入攻击
- 🔐 Fail-safe 错误处理，绝不阻塞 React 水合
- 🚨 禁用开关：`CLEANUP_DISABLE=1` 一键禁用和回滚支持

## [Unreleased]

### Planned
- 📖 文档站建设（为什么要预水合清理 / 一分钟接入 / CSP实战）
- 🎯 示例仓库：Next.js + Vite 各一个，可一键部署
- 🔐 SRI 产物（CDN场景）与完整 Integrity 示例
- 🌐 多语言支持和国际化

---

## Legend

- 🚀 新功能 (Added)
- 🏗️ 重大变更 (Changed) 
- 🐛 问题修复 (Fixed)
- 🗑️ 移除功能 (Removed)
- 🛡️ 安全相关 (Security)
- ⚠️ 废弃警告 (Deprecated)
