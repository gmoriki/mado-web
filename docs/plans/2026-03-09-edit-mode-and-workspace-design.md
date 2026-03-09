# 編集/閲覧モード + フォルダ/ZIP ワークスペース 設計

## Context

mado-web は現在「ペースト/D&D → 閲覧」の一方通行フロー。以下の2機能を追加する:

1. **編集/閲覧モード**: View / Edit / Split の3モード切替
2. **フォルダ/ZIP対応**: サイドバーファイルツリー付きワークスペース

## アーキテクチャ

### データフロー

```
[単一ファイル入力] → sessionStorage → /view → View|Edit|Split モード
[共有URL]         → URL#fragment   → /view → View|Edit|Split モード

[フォルダ/ZIP]    → JSZip/webkitdirectory → メモリ内仮想FS → /workspace → サイドバー+コンテンツ
```

### ルーティング

| パス | 役割 |
|------|------|
| `/` | ホーム（ペースト + 単一ファイルD&D + フォルダ/ZIPドロップ） |
| `/view` | 単一ファイル閲覧/編集（既存を拡張） |
| `/workspace` | フォルダ/ZIP ワークスペース（サイドバー+コンテンツ） |

## 1. 編集/閲覧モード（/view 拡張）

### 3モード

- **View**: 現在の閲覧画面（デフォルト）
- **Edit**: エディタのみ表示（全画面テキストエリア、font-mono）
- **Split**: 左エディタ / 右プレビュー（リアルタイム変換）

### UI レイアウト

```
┌─────────────────────────────────────┐
│ ← 戻る    [View|Edit|Split]  共有  │
├─────────────────────────────────────┤
│          閲覧 or 編集              │
│     (モードに応じて切替)           │
└─────────────────────────────────────┘
```

### 動作仕様

- 編集内容は `markdown` state で管理、sessionStorage にも同期
- Split モードではデバウンス 300ms で `markdownToHtml()` を再実行
- 共有URLは常に最新の markdown から生成
- モード切替はURLに影響しない（state のみ）
- TOC は View / Split モードでのみ表示

## 2. ワークスペース（/workspace 新規）

### 入力方法

ホーム画面の DropZone を拡張:
- `.zip` ファイル → JSZip で展開
- フォルダ → `<input webkitdirectory>` で読み取り

### 仮想ファイルシステム

```typescript
type VirtualFile = {
  path: string;       // "docs/intro.md"
  content: string;    // テキスト内容
  type: 'markdown' | 'text' | 'binary';
};

// Map<path, VirtualFile> でメモリ内管理
```

- バイナリファイルはツリーに表示するが開けない（グレーアウト）
- .md はレンダリング表示、その他テキスト系は `<pre>` 表示

### ファイル分類

- **markdown**: .md, .markdown
- **text**: .txt, .json, .yaml, .yml, .toml, .csv, .xml, .html, .css, .js, .ts, .py, .sh, .env, .cfg, .ini, .log
- **binary**: それ以外

### UI レイアウト

```
┌──────────┬──────────────────────────┐
│ 📁 docs  │                          │
│  ├ a.md  │  [View|Edit|Split]  共有 │
│  ├ b.md  │ ─────────────────────── │
│  └ img/  │                          │
│    └ x.png│  選択したファイルの内容  │
│          │                          │
└──────────┴──────────────────────────┘
```

- サイドバー幅: 256px（折りたたみ可能）
- モバイル: ハンバーガーメニューでサイドバー開閉
- ファイル選択でコンテンツエリア切替（編集/閲覧モード連動）
- アクティブファイルをハイライト

## 3. 新規依存関係

- `jszip` — ZIP展開（クライアントサイド、~45KB gzipped）

## 4. ファイル変更一覧

| ファイル | 状態 | 内容 |
|---------|------|------|
| `app/page.tsx` | 変更 | フォルダ/ZIPドロップ追加 |
| `app/view/page.tsx` | 変更 | Edit/Split モード追加 |
| `app/workspace/page.tsx` | 新規 | ワークスペースページ |
| `components/mode-toggle.tsx` | 新規 | View/Edit/Split切替UI |
| `components/editor-pane.tsx` | 新規 | エディタパネル（font-mono textarea） |
| `components/split-view.tsx` | 新規 | 左右分割表示コンテナ |
| `components/file-tree.tsx` | 新規 | サイドバーファイルツリー |
| `components/folder-drop-zone.tsx` | 新規 | フォルダ/ZIPドロップゾーン |
| `lib/virtual-fs.ts` | 新規 | 仮想FS構築・ツリー生成 |
| `lib/zip.ts` | 新規 | JSZip展開ラッパー |
| `components/drop-zone.tsx` | 変更 | ZIP/フォルダ判定分岐追加 |

## 5. トレードオフ

| 判断 | 選択 | 理由 |
|------|------|------|
| ZIP展開 | JSZip（クライアント） | サーバーレス維持 |
| 仮想FS | メモリ内Map | IndexedDBは過剰 |
| Split方向 | 左右分割（PCのみ） | モバイルではモード切替で対応 |
| 編集→プレビュー同期 | 300msデバウンス | 即時だとMermaid等が重い |
| フォルダ読み取り | webkitdirectory | 標準APIでは不十分、Chromium系で動作 |
