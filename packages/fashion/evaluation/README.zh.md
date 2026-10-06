# Fashion Evaluation 领域

[English](README.md) | 中文

本包提供由 Storage 支持的 registry，用于 evaluation definitions、cases、runs、rule results、human assessments 和 improvement candidates。

## 不变量归属

本包不发布运行时不变量 companion，因为 registry 与其 domain tables 组成同一个受控观察面；schema 和 registry 行为测试负责约束状态迁移。
