# Fashion Feedback 领域

[English](README.md) | 中文

本包提供由 Storage 支持的 registry，用于设计师反馈、结果可用性、开发事件和结果指标观察。

## 不变量归属

本包不发布运行时不变量 companion，因为 registry 与其 domain tables 组成同一个受控观察面；schema 和 registry 行为测试负责约束状态迁移。
