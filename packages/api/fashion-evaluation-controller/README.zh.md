# Fashion Evaluation 控制器

[English](README.md) | 中文

Host Remote 命令在保留 registry 验证和项目边界的前提下，将 Fashion Evaluation registry 暴露给浏览器客户端。

## 不变量归属

本包不发布运行时不变量 companion，因为 Remote projection 与 Client snapshot 观察同一个 registry；控制器和 registry 行为测试负责约束该边界。
