# Memos Web Clipper

A Chrome extension for clipping web pages and text directly into your self-hosted [Memos](https://github.com/usememos/memos) instance, inspired by the Obsidian Web Clipper.

![Memos Web Clipper Icon](icons/icon-128.png)

## Features

- **Full Page Clipping**: Intelligently extracts the main content of an article, filters out ads, navigation, and noise, and converts it to clean Markdown.
- **Selection Clipping**: Select any text on a page and clip only the selection, preserving its formatting in Markdown.
- **Context Menu Quick Save**: Right-click on a selection or page to clip directly to Memos without opening the popup.
- **Image Upload Support**: Automatically extracts images from the web page, downloads them, and uploads them to your Memos instance's resource API before saving. (Compatible with Memos v0.28.0 API).
- **Auto-Open Memo**: Automatically opens the newly created memo in a background tab after a successful save.
- **Custom Tags & Visibility**: Easily append tags (defaults to `#web-clip`) and set the visibility of your memo (Private, Protected, Public).
- **Bilingual Support**: Fully supports English and Chinese interfaces.

## Compatibility

This extension interacts with the `v1` REST API introduced in newer versions of Memos. 
- Fully compatible and tested with **Memos v0.28.0+**.
- Uses `/api/v1/auth/me` for connection validation.
- Uses `/api/v1/memos` for saving notes.
- Uses `/api/v1/resources` for image uploads.

## Installation (Developer Mode)

Since this extension is not yet published to the Chrome Web Store, you can load it manually:

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Toggle on **Developer mode** in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the `memos-clipper` folder.

## Configuration

1. Click on the Memos Web Clipper icon in your Chrome toolbar.
2. Click **前往设置 (Go to Settings)** or right-click the extension icon and select **Options**.
3. **Memos 服务器地址 (Server Address)**: Enter the URL of your Memos instance (e.g., `https://memos.example.com`).
4. **Access Token**: Enter your Personal Access Token.
   - You can generate a token in your Memos instance by going to **Settings > My Account > Access Tokens > Create**.
5. Click **测试连接 (Test Connection)** to verify your credentials.
6. Click **保存设置 (Save Settings)**.

## Usage

- **Via Popup**: Click the extension icon on any page. Preview the extracted Markdown, edit it if necessary, choose visibility, and hit Save.
- **Via Context Menu**: Highlight text on a webpage, right-click, and select "剪藏选中文本到 Memos" (Clip Selection to Memos).
- **Keyboard Shortcut**: Use `Cmd+Shift+M` (macOS) or `Ctrl+Shift+M` (Windows) to open the clipper popup quickly.

## Acknowledgments

This project is built for and inspired by [usememos/memos](https://github.com/usememos/memos), an open-source, privacy-first, lightweight note-taking service. Easily capture and share your great thoughts. Memos is licensed under the MIT License.

Markdown conversion is powered by [Turndown](https://github.com/mixmark-il/turndown).

## License

This project is open-sourced under the [MIT License](LICENSE).
