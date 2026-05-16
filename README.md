# Memos Web Clipper

一个专为 [Memos](https://github.com/usememos/memos) 开发的 Chrome 浏览器剪藏插件。灵感来源于 Obsidian Web Clipper，让你可以在浏览网页时，一键将网页内容或选中文本以 Markdown 格式保存到你自部署的 Memos 实例中。

![Memos Web Clipper Icon](icons/icon-128.png)

## ✨ 核心功能

- **📄 整页智能剪藏**：自动提取网页正文，过滤掉广告、侧边栏和导航等噪音，并转换为干净的 Markdown 格式。
- **✂️ 选中文本剪藏**：在网页上选中任意文字，点击剪藏只会保存选中的内容，并保留其原有的格式。
- **🖱️ 右键快捷菜单**：选中文字后，直接点击右键选择“剪藏选中文本到 Memos”，无需打开面板即可静默保存。
- **🖼️ 图片自动上传**：自动提取网页中的图片并上传到 Memos 的 Resources 接口，确保图片永久保存在你自己的服务器上，防止原链接失效。（兼容 Memos v0.28.0 资源接口）
- **🚀 保存后自动打开**：成功剪藏后，会自动在后台新标签页打开刚刚创建的 memo。
- **🏷️ 自定义标签与可见性**：每次剪藏都可以自由附加标签（默认附加 `#web-clip`）并设置 memo 的可见性（私有、受保护、公开）。

## 🔗 版本兼容性

本插件通过调用 Memos 较新版本中的 `v1` REST API 运行：
- 经过测试，**完全兼容 Memos v0.28.0+**。
- 采用 `/api/v1/auth/me` 进行连接与 Token 验证。
- 采用 `/api/v1/memos` 保存笔记内容。
- 采用 `/api/v1/resources` 进行图片上传。

## 📦 安装说明 (开发者模式)

此插件暂未上架 Chrome 应用商店，你可以通过开发者模式手动加载使用：

1. 克隆或下载本仓库代码到你的电脑上。
2. 打开 Chrome 浏览器，地址栏输入 `chrome://extensions/` 进入扩展程序页面。
3. 开启页面右上角的 **开发者模式** 开关。
4. 点击左上角的 **加载已解压的扩展程序**。
5. 选择你刚刚下载好的 `memos-clipper` 文件夹即可。

## ⚙️ 首次配置

1. 点击 Chrome 工具栏中的 Memos Web Clipper 图标。
2. 点击 **前往设置**（或右键扩展图标选择“选项”）。
3. **Memos 服务器地址**：输入你的 Memos 实例地址（例如：`https://memos.example.com`）。
4. **Access Token**：输入你的个人访问令牌。
   - 获取方式：进入你的 Memos 后台 -> **设置 (Settings)** -> **我的账号 (My Account)** -> **访问令牌 (Access Tokens)** -> **创建**。
5. 点击 **测试连接** 按钮，确保能成功连接到你的服务器。
6. 点击 **保存设置**。

## ⌨️ 快捷操作

- **呼出面板**：使用快捷键 `Cmd+Shift+M` (macOS) 或 `Ctrl+Shift+M` (Windows) 可快速打开剪藏面板。

## 🙏 致谢

本项目的诞生离不开 [usememos/memos](https://github.com/usememos/memos) —— 一个优秀的开源、隐私优先的轻量级笔记服务。Memos 基于 MIT 协议开源。

Markdown 转换功能由 [Turndown](https://github.com/mixmark-il/turndown) 强力驱动。

## 📄 协议

本项目基于 [MIT License](LICENSE) 开源。
