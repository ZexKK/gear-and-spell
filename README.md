# 齿轮与咒文 · Gear & Spell

以机械与魔法为主题的个人空间，包含游戏介绍、知识库与小工具。当前个人介绍、游戏与笔记为可替换的示例内容。

## 使用

网站是纯静态 HTML、CSS 和 JavaScript，无需安装依赖或构建。GitHub Pages 发布源选择 `main` 分支的 `/(root)`。`.nojekyll` 用于直接发布静态文件。

## 修改内容

- `index.html`：站名、首页文案、个人介绍与页面结构。
- `content.mjs`：游戏介绍、知识库文章与分类。
- `style.css`：颜色、排版与响应式样式。
- `astrolabe.svg`、`favicon.svg`：首页星仪与网站图标。
- `app.mjs`、`core.mjs`：页面交互、骰子、专注计时器与 Markdown 预览。

工具在浏览器本地运行，不需要登录。骰子历史、计时状态与 Markdown 草稿仅在当前页面会话中保留，刷新页面会重置。Markdown 编辑器支持标题、列表、引用、代码块、强调与 HTTP/HTTPS 链接，并可下载 `.md` 文件。

所有资源使用相对路径，适用于 GitHub Pages 的项目子目录地址。
