import Link from "next/link";

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert mx-auto max-w-2xl prose-headings:scroll-mt-20">
      <h1>プライバシーポリシー</h1>
      <p className="text-sm text-[var(--muted-foreground)]">最終更新日: 2026年3月14日</p>

      <p>
        mado web（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
        本サービスにおける情報の取り扱いについて、以下のとおり定めます。
      </p>

      <h2>第1条（基本方針）</h2>
      <p>
        本サービスはすべての処理をユーザーのブラウザ内で完結させており、
        ユーザーが入力したMarkdownテキストやその他のコンテンツをサーバーに送信・保存することはありません。
      </p>

      <h2>第2条（収集しない情報）</h2>
      <p>本サービスは以下の情報を収集しません。</p>
      <ul>
        <li>氏名、メールアドレス等の個人情報</li>
        <li>ユーザーが入力・貼り付けしたテキストの内容</li>
        <li>アカウント情報（アカウント機能はありません）</li>
      </ul>

      <h2>第3条（ブラウザに保存されるデータ）</h2>
      <p>
        本サービスは、ユーザーの利便性のために以下のデータをブラウザのローカルストレージに保存します。
        これらのデータはユーザーの端末内にのみ存在し、サーバーには送信されません。
      </p>
      <ul>
        <li>テーマ設定（ライト/ダーク）</li>
        <li>フォント設定</li>
        <li>閲覧履歴（プレビューテキストと共有URL）</li>
      </ul>
      <p>
        ブラウザの設定からサイトデータを消去することで、これらの情報はいつでも削除できます。
      </p>

      <h2>第4条（共有URLについて）</h2>
      <p>
        共有URL機能を利用すると、Markdownの内容が圧縮されてURL自体に埋め込まれます。
        このデータはサーバーを経由せず、URLを受け取った人が直接ブラウザで展開します。
        URLを知る人は誰でも内容を閲覧できるため、共有する内容にはご注意ください。
      </p>

      <h2>第5条（アクセス解析）</h2>
      <p>
        本サービスでは、サービス改善のためにアクセス解析ツールを使用する場合があります。
        これらのツールはCookieを使用することがありますが、個人を特定する情報は収集しません。
      </p>

      <h2>第6条（第三者提供）</h2>
      <p>
        本サービスはユーザーの情報を第三者に提供しません。
        ただし、法令に基づく場合を除きます。
      </p>

      <h2>第7条（本ポリシーの変更）</h2>
      <p>
        本ポリシーの内容は、必要に応じて変更することがあります。
        変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じます。
      </p>

      <h2>第8条（お問い合わせ）</h2>
      <p>
        本ポリシーに関するお問い合わせは、
        <a href="https://github.com/gmoriki/mado-web/issues" className="text-[var(--primary)] underline underline-offset-4">
          GitHubリポジトリのIssue
        </a>
        よりお願いいたします。
      </p>

      <hr />
      <p className="text-sm">
        <Link href="/terms" className="text-[var(--primary)] underline underline-offset-4">利用規約</Link>もあわせてご確認ください。
      </p>
    </article>
  );
}
