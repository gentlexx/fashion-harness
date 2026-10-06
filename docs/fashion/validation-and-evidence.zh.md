# 验证与证据

[English](validation-and-evidence.md) | 中文

## 1. 证据原则

验证结论必须绑定实际运行的代码状态和阶段。T-04 只覆盖公开化定向调整；T-06 对冻结应用提交进行了独立验证，但不会把保留的上游文档债务包装成通过。

## 2. 冻结状态

- 应用提交：`c1a8010b72764876b17744776d674fefc35d4ea9`
- 截图证据提交：`0a24188df7953fbc61bf21e001349b63bdd3d00e`
- 验证日期：`2026-10-06`
- 验证副本：从应用提交建立的独立本地 clone
- 运行数据：全新、隔离的本地 `DSH_HOME`
- 凭据：没有填写、读取或展示真实 API Key

## 3. T-06 结果

| 检查 | 结果 | 证据边界 |
| --- | --- | --- |
| 离线冻结锁文件安装 | 通过 | 1,267 个 package、下载数为 0；记录了不阻断的 workspace 警告 |
| 全量构建 | 通过 | 记录 252 个客户端产物和 2 个公开值；bundle 大小警告不阻断 |
| Typecheck | 通过 | 仓库定义的 typecheck 成功结束 |
| Fashion 定向测试 | 通过 | 46 个测试文件／284 个测试通过 |
| Client UI i18n | 通过 | 检查 651 个客户端 UI 源文件 |
| Package invariants | 通过 | 检查 39 个 hand-owned companion |
| TypeScript paths | 通过 | 生成的 alias 保持最新 |
| Cordis configuration | 通过 | 检查 144 个配置文件 |
| Mermaid、第三方声明、公开仓库链接 | 通过 | 对应仓库门禁成功结束 |
| 全新运行目录启动 | 通过 | Fashion profile 使用隔离本地状态成功启动 |
| 页面可访问 | 通过 | 本地页面返回 HTTP 200 与正文 |
| 无 Key 浏览 | 通过，但存在可见步骤 | 首次启动会出现 API Key 引导；可点击“稍后配置”关闭，全程未填写 Key；全新直接加载时会再次出现 |
| 人工主链检查 | 检查的确定性案例通过 | 已查看 Project、Research、Analysis、Design、Review、Deliverable 和固定 Evaluation 页面 |
| 截图证据 | 通过 | 六张 1330×1292 截图已记录 SHA-256 与场景边界 |

实际验证的运行入口为：

```bash
pnpm install --offline --frozen-lockfile
pnpm run build
pnpm run typecheck
pnpm dsh --profile fashion
```

## 4. 已披露的未通过仓库检查

T-06 **不声称**所有仓库门禁均通过：

- 全仓 translation pairing 报告 208 个问题。Fashion 专属问题为 0；所报告的中英文文档保留自上游，其链接指向候选包主动排除的 `.agents` 内容；
- Markdown 链接门禁报告 923 个断链：920 个来自保留的上游文档指向已排除的 `.agents`／`.github` 内容，另有 3 个来自既有 Fashion package README 的自锚点不匹配；
- T-06 分类中，新增根 README、`NOTICE.md`、`docs/fashion/` 和虚构演练没有产生安全扫描命中或断链；
- 在声称“全仓文档健康”之前，必须修复这些问题，或明确把相应上游文档移出公开范围。

## 5. 浏览器与产品边界

- 新建本地项目目前只填写项目名称，尚无完整 Brief 修订界面；
- 内置 R0 是固定演示内容，不是实时市场情报；
- 所链接来源的存在性和归属尚未完整复核到可公开使用状态；
- Improvement 候选不保证与所有后续来源状态保持强一致；
- 固定 Evaluation 不是真实设计师验证或商业证据，部分仓库证据依赖 Git 检出；
- 无 Key 访问只证明关闭引导后可浏览确定性工作台，不证明实时 Agent／模型动作可用。

## 6. 证据分层

- **代码证据**：领域对象、控制器、配置、测试与 package 结构；
- **自动化证据**：安装、构建、typecheck、定向测试和静态门禁日志；
- **运行证据**：隔离启动、HTTP 响应和浏览器检查；
- **视觉证据**：列入[截图证据清单](assets/screenshots/screenshot-manifest.zh.md)的六张截图；
- **版本证据**：相互分离的应用提交和证据提交；
- **人工边界复核**：明确观察界面当前尚未实现的内容。

## 7. 公开结论

冻结的 Fashion Harness 应用候选可以被重复构建；关闭首次启动引导后，无需填写 API Key 即可运行并浏览已检查的确定性 Fashion 主链。这支持作品集对产品／系统设计、AI 辅助实现协作、测试和证据化交付的能力表达，但不支持实时市场数据、自治多 Agent 生产、真实设计师效果、商业价值或全仓文档完全无问题等主张。
