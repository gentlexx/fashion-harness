# Fashion Feedback 控制器

[English](README.md) | 中文

Host Remote 命令和 Client snapshot 服务暴露设计师反馈、结果可用性、开发事件和结果观察。

## 不变量归属

本包不发布运行时不变量 companion，因为 Remote projection 与 Client snapshot 观察同一个 registry；控制器和 registry 行为测试负责约束该边界。
