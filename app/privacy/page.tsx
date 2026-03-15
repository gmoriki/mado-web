import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "mado web のプライバシーポリシー。データの取り扱い、ブラウザ保存、共有URLの仕組み。",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert mx-auto max-w-2xl prose-headings:scroll-mt-20">
      <h1>プライバシーポリシー</h1>
      <p className="text-sm text-[var(--muted-foreground)]">最終更新日: 2026年3月15日</p>

      <p>
        mado web（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
        本サービスにおける情報の取り扱いについて、以下のとおり定めます。
      </p>

      <h2>第1条（基本方針）</h2>
      <p>
        本サービスは閲覧・編集の処理をユーザーのブラウザ内で完結させています。
        共有機能を利用した場合、長いドキュメントはEnd-to-End暗号化された状態でサーバーに保存されますが、
        復号鍵はURLの中にのみ存在し、サーバーでは内容を読むことができません。
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
        また、編集中のMarkdown本体およびワークスペースデータは、ブラウザのsessionStorageに一時保存されます。
        sessionStorageのデータはブラウザタブを閉じると自動的に削除されます。
      </p>
      <p>
        ブラウザの設定からサイトデータを消去することで、これらの情報はいつでも削除できます。
      </p>

      <h2>第4条（共有URLについて）</h2>
      <p>
        共有URL機能には2つの方式があります。短いドキュメントはMarkdownの内容を圧縮してURL自体に埋め込みます（サーバー不使用）。
        長いドキュメントはブラウザ上でAES-256-GCM方式により暗号化した上でサーバーに保存されます。
        復号に必要な鍵はURLのフラグメント（#以降の部分）にのみ含まれ、HTTP仕様上サーバーには送信されません。
        暗号化データは90日後に自動削除されます。いずれの方式でも、URLを知る人は内容を閲覧できるため、共有する内容にはご注意ください。
      </p>
      <p>
        短文URLの場合、Markdownの内容がURL自体に含まれます。
        そのため、ブラウザの閲覧履歴、サーバーのアクセスログ、スクリーンショット等を通じて内容が第三者に流出する可能性があります。
        機密性の高い情報を共有する場合は、暗号化共有（長文モード）の使用を推奨します。
      </p>

      <h2>第5条（外部サービスとの通信）</h2>
      <p>
        本サービスではアクセス解析ツールは使用していません。Cookieによるトラッキングも行いません。
      </p>
      <p>
        ただし、本サービスではWebフォントとしてGoogle Fonts（Noto Sans JP、BIZ UDPGothic）を外部から読み込んでいます。
        フォントの読み込み時に、ユーザーのIPアドレスおよびUser-Agent情報がGoogleのサーバーに送信されます。
        詳細は<a href="https://policies.google.com/privacy" className="text-[var(--primary)] underline underline-offset-4">Googleプライバシーポリシー</a>をご参照ください。
      </p>

      <h2>第6条（ホスティング）</h2>
      <p>
        本サービスはCloudflare Pagesでホスティングされています。
        Cloudflareのインフラを経由するため、<a href="https://www.cloudflare.com/privacypolicy/" className="text-[var(--primary)] underline underline-offset-4">Cloudflareプライバシーポリシー</a>が適用されます。
      </p>

      <h2>第7条（第三者提供）</h2>
      <p>
        本サービスはユーザーの情報を第三者に提供しません。
        ただし、法令に基づく場合を除きます。
      </p>

      <h2>第8条（本ポリシーの変更）</h2>
      <p>
        本ポリシーの内容は、必要に応じて変更することがあります。
        変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じます。
      </p>

      <h2>第9条（お問い合わせ）</h2>
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
