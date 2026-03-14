<p align="center">
  <img src="public/logo.png" alt="mado web" width="120" />
</p>

<h1 align="center">mado web</h1>

<p align="center"><strong>Markdownを、誰でも美しく読める形に。</strong></p>

ChatGPT や Claude の出力をペーストするだけで、表・リスト・Mermaid 図をきれいにレンダリング。データはブラウザ内で完結し、サーバーには一切送信されません。

**[今すぐ使う → mado-web.com](https://mado-web.com)**

<!-- TODO: スクリーンショットを追加 -->
<!-- ![mado web screenshot](docs/screenshot.png) -->

---

## 主な機能

- **GFM 対応** — テーブル、チェックリスト、取り消し線、脚注
- **Mermaid 図** — フローチャート、シーケンス図、ER 図を SVG レンダリング
- **Edit / Split モード** — 閲覧・編集・分割プレビューを切替
- **ダーク / ライトテーマ** — ワンクリックで切替、設定は自動保存
- **フォント選択** — LINE Seed JP / Noto Sans JP / BIZ UDPGothic
- **目次** — 見出しから自動生成、クリックでジャンプ
- **ワークスペース** — ZIP やフォルダをドロップしてファイルツリー付きで閲覧
- **共有 URL** — Markdown を圧縮して URL に埋め込み、リンクだけで共有
- **完全クライアント処理** — データはブラウザ内で完結、サーバーには一切送信されません

## 使い方

1. Markdown をテキストエリアにペースト
2. 「表示する」をクリック
3. 共有したければ「共有URLをコピー」— リンクを送るだけで誰でも同じ内容を閲覧できます

ファイル（`.md` / `.txt` / `.zip`）やフォルダのドロップにも対応しています。

## 技術構成

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router, Static Export) |
| UI | React 19, Tailwind CSS 4, Motion |
| Markdown | unified / remark-gfm / remark-rehype / rehype-stringify |
| Mermaid | beautiful-mermaid |
| 圧縮 | fflate (deflate + Base64URL) |
| ZIP 展開 | JSZip |
| フォント | @fontsource/line-seed-jp, Google Fonts |
| ホスティング | Cloudflare Pages |

## ローカル開発

```bash
pnpm install
pnpm dev        # http://localhost:3005
pnpm build      # out/ に静的エクスポート
```

## ライセンス

[MIT](LICENSE)
