# Mermaid 図解ショーケース

> mado が対応している Mermaid 図の種類を紹介します。

---

## フローチャート

```mermaid
flowchart TD
    A[ユーザーがアクセス] --> B{ログイン済み?}
    B -->|Yes| C[ダッシュボード表示]
    B -->|No| D[ログイン画面]
    D --> E[認証処理]
    E -->|成功| C
    E -->|失敗| F[エラー表示]
    F --> D
    C --> G[機能選択]
    G --> H[データ閲覧]
    G --> I[設定変更]
    G --> J[レポート出力]
```

---

## 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> 下書き
    下書き --> レビュー中 : 提出
    レビュー中 --> 修正中 : 差し戻し
    修正中 --> レビュー中 : 再提出
    レビュー中 --> 承認済み : 承認
    承認済み --> 公開中 : 公開
    公開中 --> アーカイブ : 期限切れ
    公開中 --> 修正中 : 修正依頼
    アーカイブ --> [*]
```

---

## ER図

```mermaid
erDiagram
    USER ||--o{ DOCUMENT : creates
    USER ||--o{ SHARE_HISTORY : has
    DOCUMENT ||--o{ SHARE_HISTORY : generates
    DOCUMENT {
        string id PK
        string title
        text content
        datetime created_at
        datetime updated_at
    }
    USER {
        string id PK
        string email
        string name
        datetime registered_at
    }
    SHARE_HISTORY {
        string id PK
        string document_id FK
        string user_id FK
        string share_url
        boolean is_active
        datetime shared_at
    }
```

---

## XYチャート

```mermaid
xychart-beta
    title "月別アクセス数（2026年）"
    x-axis [1月, 2月, 3月, 4月, 5月, 6月]
    y-axis "アクセス数" 0 --> 5000
    bar [1200, 1800, 3200, 2800, 4100, 4500]
    line [1200, 1800, 3200, 2800, 4100, 4500]
```

---

## クラス図

```mermaid
classDiagram
    class Document {
        +String id
        +String content
        +Date createdAt
        +render() HTML
        +share() URL
    }
    class ShareHistory {
        +String id
        +String preview
        +Boolean shared
        +Date timestamp
    }
    class Encryption {
        +encrypt(text) CompressedData
        +decrypt(data) String
    }
    Document --> Encryption : uses
    Document --> ShareHistory : creates
```

---

## シーケンス図

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant App as mado web
    participant Crypto as E2E暗号化
    participant CF as Cloudflare

    User->>App: Markdownをペースト
    User->>App: 「共有」をクリック
    App->>Crypto: テキストを暗号化
    Crypto-->>App: 暗号化データ
    App->>App: URLフラグメントに埋め込み
    App-->>User: 共有リンク生成

    Note over User,CF: リンクを共有

    User->>CF: 共有リンクにアクセス
    CF-->>App: HTMLを配信
    App->>Crypto: フラグメントから復号
    Crypto-->>App: 元のMarkdown
    App-->>User: 文書を表示
```
