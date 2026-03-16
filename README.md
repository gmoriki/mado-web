<p align="center">
  <img src="public/logo.png" alt="mado web" width="120" />
</p>

<h1 align="center">mado web</h1>

<p align="center"><strong>AIの回答を、そのまま共有リンクに。</strong></p>

<p align="center">
  <a href="https://mado-web.com">mado-web.com</a>
</p>

---

ChatGPT や Claude の回答をペーストするだけで、表・リスト・図を美しく表示。リンクひとつで誰にでも共有できます。

アカウント登録もインストールも不要。ブラウザだけで今すぐ使えます。

## 使い方

1. [mado-web.com](https://mado-web.com) を開く
2. AI の回答をテキストエリアにペースト
3. 「文書にする」をクリック → Markdown が美しい文書に
4. 「共有」ボタンで共有リンクをコピー → リンクを送るだけ

ファイル（`.md` / `.txt` / `.zip`）やフォルダのドロップにも対応しています。

## 特徴

- **Markdown 表示** — 表・リスト・コードブロック・見出しをきれいに整形
- **図の自動描画** — フローチャートやシーケンス図を自動で描画（Mermaid記法）
- **リンクで共有** — アカウント不要。URLひとつで誰でも閲覧可能
- **暗号化** — 長い文書は End-to-End 暗号化。サーバーは内容を読めません
- **E2E暗号化** — 共有時も原文はサーバーに送信されません。復号鍵はURL内のみ
- **ダーク/ライトテーマ** — ワンクリックで切替
- **ワークスペース** — ZIP やフォルダをドロップしてまとめて閲覧

## セキュリティとプライバシー

- テキストの処理はすべてブラウザ内で完結
- 共有時の暗号化は AES-128-GCM（復号鍵は URL 内のみ、サーバーには送信されません）
- 暗号化データは 90 日後に自動削除
- アカウント不要、個人情報の収集なし

<details>
<summary>技術構成</summary>

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router, Static Export) |
| UI | React 19, Tailwind CSS 4, Motion |
| Markdown | unified / remark-gfm / rehype-sanitize |
| 図の描画 | beautiful-mermaid |
| 暗号化 | Web Crypto API (AES-128-GCM) |
| 圧縮 | fflate (deflate + Base64URL) |
| ホスティング | Cloudflare Pages |

</details>

<details>
<summary>ローカル開発</summary>

```bash
pnpm install
pnpm dev        # http://localhost:3005
pnpm build      # out/ に静的エクスポート
```

</details>

## ライセンス

[MIT](LICENSE)
