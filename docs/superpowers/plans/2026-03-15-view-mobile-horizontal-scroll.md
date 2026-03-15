# ビューページ横スクロール完全修正 Implementation Plan v2

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** /view ページのスマホ横スクロールと文字埋もれを完全に除去する

**Architecture:** flex min-width問題の修正 + コンテンツ制約の強化

**Tech Stack:** Tailwind CSS v4, Next.js App Router (static export)

---

## なぜ今までの修正が全部効かなかったか

### レイアウト構造

```
<body class="flex flex-col overflow-x-hidden">        ← min-width: auto (デフォルト)
  <main class="mx-auto max-w-4xl px-4 flex-1">       ← min-width: auto (デフォルト)
    <div class="overflow-x-hidden">                    ← ビューページルート
      <article class="prose max-w-2xl">               ← レンダリングされたMarkdown
        <pre><code>長いコード...</code></pre>           ← これが320pxを超える
      </article>
    </div>
  </main>
</body>
```

### 問題の連鎖

1. `<pre>` 内の長いコード行が 320px を超える
2. `<article>` は `max-w-2xl` だが、flexの子なので **`min-width: auto`** が効く
3. `min-width: auto` = **コンテンツの固有幅より小さくならない**
4. → article が 320px を超えて広がる
5. → ビューページルートdivの `overflow-x-hidden` は効いているが、**親のmainが既に広がっている**
6. → main も `flex-1` (flex child) なので `min-width: auto` で広がる
7. → body も `flex flex-col` なので `min-width: auto` で広がる
8. → **ページ全体がビューポートより広くなる → 横スクロール発生**
9. body の `overflow-x-hidden` はiOS Safariで効かない（既知バグ）

### なぜ `overflow-x-hidden` だけでは直らないか

`overflow-x: hidden` はコンテンツをクリップするが、**flex itemの `min-width: auto` を上書きしない**。
親要素がすでにビューポートより広がった状態では、子にいくら `overflow-x-hidden` を付けても意味がない。

### 根本修正

**`min-w-0` (min-width: 0) をflexチェーンに追加する。**

これにより flex item が「コンテンツの固有幅より小さくてもいい」となり、
`max-w-4xl` や `overflow-x-hidden` が初めて正しく機能する。

---

## 修正タスク

### Task 1: main要素に `min-w-0` を追加（最重要）

**Files:** `app/layout.tsx:83`

```tsx
// 変更前
<main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 flex-1">

// 変更後
<main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 flex-1 min-w-0">
```

これが**唯一の根本修正**。flex-1の子がコンテンツ幅に引っ張られなくなる。

### Task 2: ビューページルートdivを簡素化

**Files:** `app/view/page.tsx:280`

```tsx
// 変更前
<div className="w-full max-w-full overflow-x-hidden">

// 変更後
<div className="min-w-0">
```

`w-full max-w-full overflow-x-hidden` は全部不要だった。
main に `min-w-0` があれば、この div は flex item ではないので通常は不要。
ただし安全のため `min-w-0` だけ残す。

### Task 3: prose のオーバーフロー制御を整理

**Files:** `app/globals.css`

変更なし。現状のルールで十分:
- `.prose :where(pre)` → `overflow-x: auto`（コードブロック内スクロール）
- `.prose :where(table)` → `overflow-x: auto`（テーブル内スクロール）
- `.prose` → `overflow-wrap: break-word; word-break: break-word`（テキスト折返し）

main が `min-w-0` で正しく縮むようになれば、これらが正常に機能する。

### Task 4: ビルド・検証・デプロイ

- [ ] `pnpm build` で成功確認
- [ ] コミット・プッシュ・デプロイ

---

## 検証チェックリスト（スマホ実機）

- [ ] /view でサンプル文書（コードブロック、テーブル、Mermaid図あり） → 横スクロールなし
- [ ] コードブロック内 → 指で横スクロール可能（ブロック内のみ）
- [ ] テーブル → 指で横スクロール可能（テーブル内のみ）
- [ ] 文字が埋もれていない（クリップされていない）
- [ ] 下部ツールバー → 画面幅内に収まっている
